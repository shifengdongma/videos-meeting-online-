"""
Migration script to add missing columns to the database.
Run this script to fix schema mismatches.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")


def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get existing columns in live_streams table
    cursor.execute("PRAGMA table_info(live_streams)")
    live_streams_columns = [col[1] for col in cursor.fetchall()]
    print(f"Existing live_streams columns: {live_streams_columns}")

    # Get existing columns in votes table
    cursor.execute("PRAGMA table_info(votes)")
    votes_columns = [col[1] for col in cursor.fetchall()]
    print(f"Existing votes columns: {votes_columns}")

    changes_made = False

    # Add parent_id to live_streams if missing
    if "parent_id" not in live_streams_columns:
        print("Adding parent_id column to live_streams table...")
        # SQLite doesn't support adding FK columns via ALTER TABLE,
        # so we add it as a plain integer column
        cursor.execute("ALTER TABLE live_streams ADD COLUMN parent_id INTEGER")
        print("Added parent_id column to live_streams")
        changes_made = True
    else:
        print("parent_id column already exists in live_streams")

    # Add created_at to votes if missing
    if "created_at" not in votes_columns:
        print("Adding created_at column to votes table...")
        # SQLite doesn't allow non-constant defaults, add without default first
        cursor.execute("ALTER TABLE votes ADD COLUMN created_at DATETIME")
        # Update existing rows with current timestamp
        cursor.execute("UPDATE votes SET created_at = datetime('now') WHERE created_at IS NULL")
        print("Added created_at column to votes")
        changes_made = True
    else:
        print("created_at column already exists in votes")

    # Add status to votes if missing
    if "status" not in votes_columns:
        print("Adding status column to votes table...")
        cursor.execute("ALTER TABLE votes ADD COLUMN status VARCHAR(10) DEFAULT 'voting'")
        # Update existing rows with default status
        cursor.execute("UPDATE votes SET status = 'voting' WHERE status IS NULL")
        print("Added status column to votes")
        changes_made = True
    else:
        print("status column already exists in votes")

    if changes_made:
        conn.commit()
        print("\nMigration completed successfully!")
    else:
        print("\nNo migration needed - all columns already exist.")

    conn.close()


if __name__ == "__main__":
    migrate()