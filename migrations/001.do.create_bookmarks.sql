BEGIN;

CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  rating INTEGER DEFAULT 0 NOT NULL
);

COMMIT;