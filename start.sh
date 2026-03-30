#!/bin/bash

# 视频会议管理系统启动脚本
# 使用方法: ./start.sh [选项]
#   ./start.sh          # 启动后端服务
#   ./start.sh backend  # 启动后端服务
#   ./start.sh frontend # 启动前端服务
#   ./start.sh all      # 同时启动前后端

# 项目根目录
PROJECT_ROOT="/www/videos-meeting"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 设置 OpenSSL 库路径（Python SSL 模块需要）
export LD_LIBRARY_PATH="/usr/local/openssl111/lib:$LD_LIBRARY_PATH"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 端口清理防呆函数
free_port() {
    local port=$1
    # 尝试使用 lsof (如果系统安装了)
    if command -v lsof >/dev/null 2>&1; then
        local pids=$(lsof -t -i:$port)
        if [ -n "$pids" ]; then
            log_warn "端口 $port 被占用，正在强制清理进程: $pids ..."
            kill -9 $pids >/dev/null 2>&1
            sleep 1
        fi
    # 尝试使用 fuser
    elif command -v fuser >/dev/null 2>&1; then
        if fuser $port/tcp >/dev/null 2>&1; then
            log_warn "端口 $port 被占用，正在强制清理..."
            fuser -k -9 $port/tcp >/dev/null 2>&1
            sleep 1
        fi
    # 兼容 CentOS 7 自带的 ss
    elif command -v ss >/dev/null 2>&1; then
        local pid=$(ss -nlp | grep ":$port " | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
        if [ -n "$pid" ]; then
            log_warn "端口 $port 被进程 $pid 占用，正在强制清理..."
            kill -9 $pid >/dev/null 2>&1
            sleep 1
        fi
    fi
}

# 启动 ngrok 内网穿透后台服务并获取 HTTPS URL
start_ngrok() {
    if command -v ngrok >/dev/null 2>&1; then
        log_info "正在启动 ngrok 内网穿透 (后台运行)..."
        # 清理可能残留的旧 ngrok 进程
        killall -9 ngrok >/dev/null 2>&1
        
        # 使用 nohup 将 ngrok 放入后台静默运行，并穿透前端的 5173 端口
        nohup env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u all_proxy -u ALL_PROXY ngrok http 5173 > /dev/null 2>&1 &
        
        # 等待 ngrok 连接服务器并生成隧道
        sleep 5
        
        # 调用 ngrok 的本地 API 提取自动分配的公共 HTTPS 地址
        # 这里使用 grep 和 cut 提取，兼容 CentOS 7 (不需要安装额外工具)
        local NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | grep -v 'localhost' | cut -d'"' -f4 | head -n 1)
        
        if [ -n "$NGROK_URL" ]; then
            echo -e "=========================================================="
            echo -e "🎉 ${GREEN}ngrok 穿透成功！${NC}"
            echo -e "👉 ${CYAN}请在本地浏览器访问此安全地址: ${NC}${GREEN}${NGROK_URL}${NC}"
            echo -e "（使用此 HTTPS 地址访问，即可正常开启摄像头和屏幕共享）"
            echo -e "=========================================================="
        else
            log_warn "ngrok 已启动，但未能自动获取到 HTTPS 地址。请确保您已经执行过 'ngrok config add-authtoken'。"
        fi
    else
        log_warn "未检测到 ngrok 安装。如果是线上正式环境请忽略此警告；如果是本地测试，请先安装 ngrok。"
    fi
}

# 启动后端服务
start_backend() {
    log_info "正在启动后端服务..."

    # 启动前自动清理 8001 端口
    free_port 8001

    cd "$BACKEND_DIR" || {
        log_error "无法进入后端目录: $BACKEND_DIR"
        exit 1
    }

    # 检查虚拟环境是否存在
    if [ ! -d "venv" ]; then
        log_warn "虚拟环境不存在，正在创建..."
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi

    log_info "后端服务启动在 http://0.0.0.0:8001"
    log_info "API 文档地址 http://0.0.0.0:8001/docs"

    python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
}

# 启动前端服务
start_frontend() {
    log_info "正在启动前端服务..."

    # 启动前自动清理 5173 端口
    free_port 5173

    cd "$FRONTEND_DIR" || {
        log_error "无法进入前端目录: $FRONTEND_DIR"
        exit 1
    }

    # 检查 node_modules 是否存在
    if [ ! -d "node_modules" ]; then
        log_warn "依赖未安装，正在安装..."
        npm install
    fi

    # 检查是否存在 dist 目录，不存在则自动执行生产打包
    if [ ! -d "dist" ]; then
        log_warn "未发现打包好的 dist 目录，正在执行生产打包 (npm run build)..."
        npm run build
        if [ $? -ne 0 ]; then
            log_error "前端打包失败！请在本地电脑执行 npm run build 后，将生成的 dist 目录完整上传到 $FRONTEND_DIR 下。"
            exit 1
        fi
    fi

    log_info "前端静态服务原地址: http://0.0.0.0:5173"
    cd dist || exit 1
    
    # 尝试启动 ngrok 穿透
    start_ngrok

    # 阻塞运行静态服务
    python3 -m http.server 5173
}

# 同时启动前后端
start_all() {
    log_info "正在同时启动前后端服务..."

    # 启动前清理 8001 和 5173 端口
    free_port 8001
    free_port 5173

    # 在后台启动后端
    cd "$BACKEND_DIR" || exit 1

    if [ ! -d "venv" ]; then
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi

    python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &
    BACKEND_PID=$!
    log_info "后端服务已在后台启动 (PID: $BACKEND_PID)"

    # 等待后端启动
    sleep 3

    # 启动前端
    cd "$FRONTEND_DIR" || exit 1

    if [ ! -d "node_modules" ]; then
        npm install
    fi

    if [ ! -d "dist" ]; then
        log_warn "未发现打包好的 dist 目录，正在执行生产打包 (npm run build)..."
        npm run build
        if [ $? -ne 0 ]; then
            log_error "前端打包失败！建议在本地电脑打包后上传 dist 目录。"
            log_warn "正在清理后台运行的后端进程 (PID: $BACKEND_PID)..."
            kill -9 $BACKEND_PID 2>/dev/null
            exit 1
        fi
    fi

    log_info "前端服务启动中..."
    log_info "前端服务原地址: http://0.0.0.0:5173"
    cd dist || exit 1
    
    # 尝试启动 ngrok 穿透
    start_ngrok

    # 阻塞当前终端运行前端静态服务
    python3 -m http.server 5173
}

# 显示帮助信息
show_help() {
    echo "视频会议管理系统启动脚本"
    echo ""
    echo "使用方法:"
    echo "  ./start.sh          启动后端服务"
    echo "  ./start.sh backend  启动后端服务"
    echo "  ./start.sh frontend 启动前端服务"
    echo "  ./start.sh all      同时启动前后端"
    echo "  ./start.sh help     显示帮助信息"
    echo ""
    echo "访问地址:"
    echo "  后端 API:  http://0.0.0.0:8001"
    echo "  API 文档:  http://0.0.0.0:8001/docs"
    echo "  前端页面:  http://0.0.0.0:5173 (如果有安装 ngrok 会自动生成 HTTPS 地址)"
}

# 捕获 Ctrl+C 信号，清理残留进程
trap 'log_info "\n正在停止所有服务..."; kill -9 $BACKEND_PID 2>/dev/null; killall -9 ngrok 2>/dev/null; exit 0' SIGINT

# 主入口
case "${1:-backend}" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    all)
        start_all
        ;;
    help|-h|--help)
        show_help
        ;;
    *)
        log_error "未知选项: $1"
        show_help
        exit 1
        ;;
esac