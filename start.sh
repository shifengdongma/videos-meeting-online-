#!/bin/bash

# ============================================================
# 视频会议管理系统启动脚本
# ============================================================
# 项目结构:
#   backend/  - FastAPI 后端 (端口 8001)
#   frontend/ - Vue 3 + Vite 前端 (开发端口 5173)
#
# 使用方法:
#   ./start.sh           # 同时启动前后端 (默认开发模式)
#   ./start.sh dev       # 开发模式: 后端后台 + 前端前台
#   ./start.sh prod      # 生产模式: Nginx + Ngrok 代理
#   ./start.sh backend   # 仅启动后端
#   ./start.sh frontend  # 仅启动前端开发服务
#   ./start.sh build     # 仅构建前端
#   ./start.sh help      # 显示帮助
# ============================================================

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 设置 OpenSSL 库路径（Python SSL 模块需要）
export LD_LIBRARY_PATH="/usr/local/openssl111/lib:$LD_LIBRARY_PATH"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
# 工具函数
# ============================================================

# 清理端口占用
free_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        local pids=$(lsof -t -i:$port 2>/dev/null)
        if [ -n "$pids" ]; then
            log_warn "端口 $port 被占用，正在清理进程..."
            kill -9 $pids >/dev/null 2>&1
            sleep 1
        fi
    fi
}

# 检查/启动 Nginx
check_nginx() {
    if ! command -v nginx >/dev/null 2>&1; then
        log_error "Nginx 未安装，请先安装: yum install nginx -y"
        exit 1
    fi

    log_info "检查 Nginx 服务状态..."
    if systemctl is-active --quiet nginx 2>/dev/null; then
        systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null
        log_info "Nginx 配置已重新加载"
    else
        log_warn "Nginx 未运行，正在启动..."
        systemctl start nginx 2>/dev/null || nginx 2>/dev/null
        if [ $? -ne 0 ]; then
            log_error "Nginx 启动失败"
            exit 1
        fi
        log_info "Nginx 已启动"
    fi
}

# 配置 Nginx (生产模式)
setup_nginx_config() {
    local nginx_conf_dir="/etc/nginx"
    local config_file="$nginx_conf_dir/conf.d/videos-meeting.conf"

    # 检查 Nginx 配置目录
    if [ ! -d "$nginx_conf_dir/conf.d" ]; then
        mkdir -p "$nginx_conf_dir/conf.d"
    fi

    # 生成 Nginx 配置 (包含 WebSocket 支持)
    cat > "$config_file" << 'NGINX_CONF'
server {
    listen 80;
    server_name localhost;

    # 前端静态文件
    location / {
        root /www/videos-meeting/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 代理 - 会议室
    location /ws/meetings/ {
        proxy_pass http://127.0.0.1:8001/ws/meetings/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # WebSocket 代理 - 直播间
    location /ws/live/ {
        proxy_pass http://127.0.0.1:8001/ws/live/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
NGINX_CONF

    log_info "Nginx 配置已写入: $config_file"
}

# 启动 ngrok 内网穿透
start_ngrok() {
    if ! command -v ngrok >/dev/null 2>&1; then
        log_warn "未检测到 ngrok，跳过内网穿透"
        return 0
    fi

    log_info "启动 ngrok 内网穿透..."
    killall -9 ngrok 2>/dev/null

    # 屏蔽系统代理环境变量，穿透 Nginx 80 端口
    nohup env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY \
        ngrok http 80 > /tmp/ngrok.log 2>&1 &

    sleep 3

    # 获取公网 HTTPS 地址
    local ngrok_url=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null \
        | grep -o '"public_url":"https://[^"]*"' \
        | cut -d'"' -f4 | head -n 1)

    if [ -n "$ngrok_url" ]; then
        echo ""
        echo -e "============================================================"
        echo -e "  ${GREEN}ngrok 穿透成功！${NC}"
        echo -e "  ${CYAN}请在浏览器访问:${NC} ${GREEN}${ngrok_url}${NC}"
        echo -e "  前后端均处于安全的 HTTPS 环境中"
        echo -e "============================================================"
        echo ""
    else
        log_warn "ngrok 已启动但未获取到 HTTPS 地址，请检查 ngrok 配置"
    fi
}

# 激活后端虚拟环境
activate_backend_venv() {
    cd "$BACKEND_DIR" || { log_error "无法进入后端目录"; exit 1; }

    # 智能检测虚拟环境目录 (优先使用 venv，兼容 .venv)
    local venv_dir=""
    if [ -d "venv" ]; then
        venv_dir="venv"
    elif [ -d ".venv" ]; then
        venv_dir=".venv"
    fi

    if [ -z "$venv_dir" ]; then
        log_warn "虚拟环境不存在，正在创建 venv..."
        python3 -m venv venv
        venv_dir="venv"
        source "$venv_dir/bin/activate"
        pip install -r requirements.txt -q
    else
        source "$venv_dir/bin/activate"
    fi

    log_info "已激活虚拟环境: $venv_dir"
}

# ============================================================
# 启动函数
# ============================================================

# 默认模式: 同时启动前后端 (后端后台 + 前端前台)
start_all() {
    log_info "启动前后端服务..."

    # 1. 后台启动后端
    free_port 8001
    activate_backend_venv

    python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    log_info "后端已启动 (PID: $BACKEND_PID) - http://127.0.0.1:8001"
    sleep 2

    # 2. 前台启动前端
    cd "$FRONTEND_DIR" || { log_error "无法进入前端目录"; kill -9 $BACKEND_PID; exit 1; }

    if [ ! -d "node_modules" ]; then
        log_warn "安装前端依赖..."
        npm install --silent
    fi

    free_port 5173

    echo ""
    echo -e "============================================================"
    echo -e "  ${GREEN}服务已全部启动！${NC}"
    echo -e "  ${CYAN}前端:${NC} http://127.0.0.1:5173"
    echo -e "  ${CYAN}后端:${NC} http://127.0.0.1:8001 (API 文档: /docs)"
    echo -e "  按 ${YELLOW}Ctrl+C${NC} 可同时停止前后端"
    echo -e "============================================================"
    echo ""

    # 捕获 Ctrl+C 清理所有进程
    trap 'log_info "\n正在停止所有服务..."; kill -9 $BACKEND_PID 2>/dev/null; log_info "前后端已停止"; exit 0' SIGINT INT TERM

    # 前台运行前端开发服务
    npm run dev
}

# 生产模式: Nginx + Ngrok
start_prod() {
    log_info "启动生产模式..."

    # 1. 后台启动后端
    free_port 8001
    activate_backend_venv

    python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    log_info "后端服务已启动 (PID: $BACKEND_PID)"
    sleep 2

    # 2. 构建前端 (如果需要)
    cd "$FRONTEND_DIR" || { log_error "无法进入前端目录"; exit 1; }

    if [ ! -d "node_modules" ]; then
        log_warn "安装前端依赖..."
        npm install --silent
    fi

    if [ ! -d "dist" ] || [ "$(find src -newer dist -type f 2>/dev/null | head -1)" ]; then
        log_warn "构建前端..."
        npm run build
        if [ $? -ne 0 ]; then
            log_error "前端构建失败"
            kill -9 $BACKEND_PID 2>/dev/null
            exit 1
        fi
    fi

    # 3. 配置并启动 Nginx
    setup_nginx_config
    check_nginx

    # 4. 启动 ngrok
    start_ngrok

    log_info "生产环境已就绪"
    log_info "按 Ctrl+C 退出并清理进程"

    # 持续监控
    trap 'log_info "正在停止服务..."; kill -9 $BACKEND_PID 2>/dev/null; killall -9 ngrok 2>/dev/null; log_info "服务已停止"; exit 0' SIGINT

    # 显示 Nginx 日志
    mkdir -p /var/log/nginx
    touch /var/log/nginx/access.log
    tail -f /var/log/nginx/access.log /tmp/backend.log 2>/dev/null
}

# 仅启动后端
start_backend() {
    log_info "启动后端服务..."
    free_port 8001
    activate_backend_venv

    log_info "后端 API: http://127.0.0.1:8001"
    log_info "WebSocket: ws://127.0.0.1:8001/ws/meetings/{id} 或 /ws/live/{id}"

    python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
}

# 仅启动前端开发服务
start_frontend() {
    log_info "启动前端开发服务..."
    cd "$FRONTEND_DIR" || { log_error "无法进入前端目录"; exit 1; }

    if [ ! -d "node_modules" ]; then
        log_warn "安装前端依赖..."
        npm install --silent
    fi

    free_port 5173

    log_info "前端开发服务: http://127.0.0.1:5173"
    log_info "请确保后端已在 8001 端口运行"

    npm run dev
}

# 仅构建前端
build_frontend() {
    log_info "构建前端..."
    cd "$FRONTEND_DIR" || { log_error "无法进入前端目录"; exit 1; }

    if [ ! -d "node_modules" ]; then
        log_warn "安装前端依赖..."
        npm install --silent
    fi

    npm run build

    if [ $? -eq 0 ]; then
        log_info "前端构建完成: $FRONTEND_DIR/dist"
    else
        log_error "前端构建失败"
        exit 1
    fi
}

# 显示帮助
show_help() {
    echo ""
    echo "视频会议管理系统启动脚本"
    echo ""
    echo "使用方法:"
    echo "  ./start.sh           同时启动前后端 (默认，推荐)"
    echo "  ./start.sh dev       开发模式: 后端后台 + 前端前台"
    echo "  ./start.sh prod      生产模式: Nginx + Ngrok 代理部署"
    echo "  ./start.sh backend   仅启动后端 API 服务"
    echo "  ./start.sh frontend  仅启动前端 Vite 开发服务"
    echo "  ./start.sh build     仅构建前端生产版本"
    echo "  ./start.sh help      显示此帮助信息"
    echo ""
    echo "端口说明:"
    echo "  后端 API:    http://127.0.0.1:8001"
    echo "  前端开发:    http://127.0.0.1:5173"
    echo "  生产入口:    Nginx 80 端口 (可通过 ngrok 获取 HTTPS)"
    echo ""
    echo "WebSocket 路由:"
    echo "  会议室: ws://127.0.0.1:8001/ws/meetings/{meeting_id}"
    echo "  直播间: ws://127.0.0.1:8001/ws/live/{live_id}"
    echo ""
}

# ============================================================
# 主入口
# ============================================================

case "${1:-all}" in
    all|"")
        start_all
        ;;
    dev)
        start_all
        ;;
    prod)
        start_prod
        ;;
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    build)
        build_frontend
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