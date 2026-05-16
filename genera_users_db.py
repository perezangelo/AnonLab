import sqlite3

# Crea (o sovrascrive) il database
conn = sqlite3.connect("users.db")
cur = conn.cursor()

# Crea la tabella users
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
);
""")

# Inserisce un utente di test
cur.execute("""
INSERT OR REPLACE INTO users (id, username, email, password, created_at)
VALUES (1, 'testuser', 'test@example.com', '123456', '2026-05-16 11:49');
""")

conn.commit()
conn.close()

print("users.db creato correttamente.")
