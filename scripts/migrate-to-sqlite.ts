/**
 * MongoDB → SQLite Migration Script
 *
 * Migrates ALL data from every MongoDB collection into a single SQLite database.
 * Designed for use in the Quran Malayalam mobile app.
 *
 * Usage:
 *   npx ts-node scripts/migrate-to-sqlite.ts
 *
 * Output:
 *   quran_malayalam.db  (in project root, or set SQLITE_OUTPUT_PATH env var)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import mongoose from 'mongoose';
import Database, { Database as BetterSQLite3Database } from 'better-sqlite3';

// ---------------------------------------------------------------------------
// 1. Environment setup
// ---------------------------------------------------------------------------

// Try .env.local first (Next.js convention), then fall back to .env
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('✔  Loaded environment from .env.local');
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✔  Loaded environment from .env');
} else {
  console.warn('⚠  No .env / .env.local file found. Relying on shell environment variables.');
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('✖  MONGODB_URI is not defined. Aborting.');
  process.exit(1);
}

const SQLITE_OUTPUT_PATH =
  process.env.SQLITE_OUTPUT_PATH ?? path.join(__dirname, '..', 'quran_malayalam.db');

// ---------------------------------------------------------------------------
// 2. Mongoose model definitions (inline to avoid Next.js module side-effects)
// ---------------------------------------------------------------------------

interface IAboutUs {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IAuthor {
  _id: mongoose.Types.ObjectId;
  htmlContent: string;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IContactUs {
  _id: mongoose.Types.ObjectId;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  remarks?: string;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IHelp {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  icon?: string;
  order?: number;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IInterpretation {
  _id: mongoose.Types.ObjectId;
  suraNumber: number;
  ayaRangeStart: number;
  ayaRangeEnd: number;
  interpretationNumber: number;
  language: string;
  interpretationText: string;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IPageEntry {
  surahNumber: number;
  ayahFrom: number;
  ayahTo: number;
  blockFrom: number;
  blockTo: number;
}

interface IPageHandler {
  _id: mongoose.Types.ObjectId;
  pageNo: number;
  entries: IPageEntry[];
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ISura {
  _id: mongoose.Types.ObjectId;
  suraNumber: number;
  name: string;
  arabicName?: string;
  description?: string;
  ayathCount: number;
  place: string;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ITranslation {
  _id: mongoose.Types.ObjectId;
  suraNumber: number;
  ayaRangeStart: number;
  ayaRangeEnd: number;
  language: string;
  translationText: string;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IUser {
  _id: mongoose.Types.ObjectId;
  loginCode: string;
  role: string;
  lastLogin?: Date;
  loginCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  contentType: string;
  contentId: string;
  action: string;
  performedBy: string;
  role: string;
  details?: string;
  previousData?: object;
  newData?: object;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// 3. Register Mongoose models
// ---------------------------------------------------------------------------

function registerModels() {
  const { Schema } = mongoose;

  if (!mongoose.models.Sura) {
    mongoose.model(
      'Sura',
      new Schema(
        {
          suraNumber: Number,
          name: String,
          arabicName: String,
          description: String,
          ayathCount: Number,
          place: String,
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.Translation) {
    mongoose.model(
      'Translation',
      new Schema(
        {
          suraNumber: Number,
          ayaRangeStart: Number,
          ayaRangeEnd: Number,
          language: String,
          translationText: String,
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.Interpretation) {
    mongoose.model(
      'Interpretation',
      new Schema(
        {
          suraNumber: Number,
          ayaRangeStart: Number,
          ayaRangeEnd: Number,
          interpretationNumber: Number,
          language: String,
          interpretationText: String,
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.AboutUs) {
    mongoose.model(
      'AboutUs',
      new Schema(
        {
          title: String,
          description: String,
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.Author) {
    mongoose.model(
      'Author',
      new Schema(
        {
          htmlContent: String,
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.ContactUs) {
    mongoose.model(
      'ContactUs',
      new Schema(
        {
          mobile: String,
          whatsapp: String,
          email: String,
          address: String,
          remarks: String,
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.Help) {
    mongoose.model(
      'Help',
      new Schema(
        {
          title: String,
          description: String,
          icon: String,
          order: Number,
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.User) {
    mongoose.model(
      'User',
      new Schema(
        {
          loginCode: String,
          role: String,
          lastLogin: Date,
          loginCount: Number,
          isActive: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.PageHandler) {
    const PageEntrySchema = new Schema(
      {
        surahNumber: Number,
        ayahFrom: Number,
        ayahTo: Number,
        blockFrom: Number,
        blockTo: Number,
      },
      { _id: false }
    );
    mongoose.model(
      'PageHandler',
      new Schema(
        {
          pageNo: Number,
          entries: [PageEntrySchema],
          createdBy: String,
          createdByRole: String,
          verifiedBy: String,
          verifiedAt: Date,
          isVerified: Boolean,
        },
        { timestamps: true }
      )
    );
  }

  if (!mongoose.models.AuditLog) {
    mongoose.model(
      'AuditLog',
      new Schema(
        {
          contentType: String,
          contentId: String,
          action: String,
          performedBy: String,
          role: String,
          details: String,
          previousData: Schema.Types.Mixed,
          newData: Schema.Types.Mixed,
        },
        { timestamps: { createdAt: true, updatedAt: false } }
      )
    );
  }
}

// ---------------------------------------------------------------------------
// 4. SQLite schema creation
// ---------------------------------------------------------------------------

function createSQLiteSchema(db: BetterSQLite3Database) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS suras (
      id               TEXT PRIMARY KEY,
      sura_number      INTEGER NOT NULL UNIQUE,
      name             TEXT    NOT NULL,
      arabic_name      TEXT,
      description      TEXT,
      ayath_count      INTEGER NOT NULL,
      place            TEXT    NOT NULL CHECK(place IN ('Mecca', 'Medina')),
      created_by       TEXT    NOT NULL,
      created_by_role  TEXT    NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by      TEXT,
      verified_at      TEXT,
      is_verified      INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL,
      updated_at       TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS translations (
      id               TEXT PRIMARY KEY,
      sura_number      INTEGER NOT NULL,
      aya_range_start  INTEGER NOT NULL,
      aya_range_end    INTEGER NOT NULL,
      language         TEXT    NOT NULL DEFAULT 'Malayalam',
      translation_text TEXT    NOT NULL,
      created_by       TEXT    NOT NULL,
      created_by_role  TEXT    NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by      TEXT,
      verified_at      TEXT,
      is_verified      INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL,
      updated_at       TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_translations_sura
      ON translations (sura_number, aya_range_start, language);

    CREATE TABLE IF NOT EXISTS interpretations (
      id                     TEXT PRIMARY KEY,
      sura_number            INTEGER NOT NULL,
      aya_range_start        INTEGER NOT NULL,
      aya_range_end          INTEGER NOT NULL,
      interpretation_number  INTEGER NOT NULL,
      language               TEXT    NOT NULL DEFAULT 'Malayalam',
      interpretation_text    TEXT    NOT NULL,
      created_by             TEXT    NOT NULL,
      created_by_role        TEXT    NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by            TEXT,
      verified_at            TEXT,
      is_verified            INTEGER NOT NULL DEFAULT 0,
      created_at             TEXT    NOT NULL,
      updated_at             TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_interpretations_sura
      ON interpretations (sura_number, interpretation_number, language);

    CREATE TABLE IF NOT EXISTS about_us (
      id               TEXT PRIMARY KEY,
      title            TEXT NOT NULL,
      description      TEXT NOT NULL,
      created_by       TEXT NOT NULL,
      created_by_role  TEXT NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by      TEXT,
      verified_at      TEXT,
      is_verified      INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL,
      updated_at       TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS authors (
      id               TEXT PRIMARY KEY,
      html_content     TEXT NOT NULL,
      created_by       TEXT NOT NULL,
      created_by_role  TEXT NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by      TEXT,
      verified_at      TEXT,
      is_verified      INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL,
      updated_at       TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_us (
      id               TEXT PRIMARY KEY,
      mobile           TEXT,
      whatsapp         TEXT,
      email            TEXT,
      address          TEXT,
      remarks          TEXT,
      created_by       TEXT NOT NULL,
      created_by_role  TEXT NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by      TEXT,
      verified_at      TEXT,
      is_verified      INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL,
      updated_at       TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS help (
      id               TEXT PRIMARY KEY,
      title            TEXT    NOT NULL,
      description      TEXT    NOT NULL,
      icon             TEXT,
      sort_order       INTEGER NOT NULL DEFAULT 0,
      created_by       TEXT    NOT NULL,
      created_by_role  TEXT    NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by      TEXT,
      verified_at      TEXT,
      is_verified      INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL,
      updated_at       TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      login_code    TEXT    NOT NULL UNIQUE,
      role          TEXT    NOT NULL CHECK(role IN ('creator', 'verifier')),
      last_login    TEXT,
      login_count   INTEGER NOT NULL DEFAULT 0,
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT    NOT NULL,
      updated_at    TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_handlers (
      id               TEXT PRIMARY KEY,
      page_no          INTEGER NOT NULL UNIQUE,
      created_by       TEXT    NOT NULL,
      created_by_role  TEXT    NOT NULL CHECK(created_by_role IN ('creator', 'verifier')),
      verified_by      TEXT,
      verified_at      TEXT,
      is_verified      INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL,
      updated_at       TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_page_handlers_page_no
      ON page_handlers (page_no);

    CREATE TABLE IF NOT EXISTS page_handler_entries (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      page_handler_id   TEXT    NOT NULL,
      surah_number      INTEGER NOT NULL,
      ayah_from         INTEGER NOT NULL,
      ayah_to           INTEGER NOT NULL,
      block_from        INTEGER NOT NULL,
      block_to          INTEGER NOT NULL,
      FOREIGN KEY (page_handler_id) REFERENCES page_handlers(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_page_handler_entries_handler
      ON page_handler_entries (page_handler_id);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id             TEXT PRIMARY KEY,
      content_type   TEXT NOT NULL,
      content_id     TEXT NOT NULL,
      action         TEXT NOT NULL CHECK(action IN ('create', 'update', 'delete', 'verify')),
      performed_by   TEXT NOT NULL,
      role           TEXT NOT NULL CHECK(role IN ('creator', 'verifier')),
      details        TEXT,
      previous_data  TEXT,
      new_data       TEXT,
      created_at     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_logs_content
      ON audit_logs (content_type, content_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by
      ON audit_logs (performed_by);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
      ON audit_logs (created_at);
  `);
}

// ---------------------------------------------------------------------------
// 5. Helper utilities
// ---------------------------------------------------------------------------

const toIso = (d?: Date | null): string | null =>
  d instanceof Date && !isNaN(d.getTime()) ? d.toISOString() : null;

const toBool = (v?: boolean | null): number => (v ? 1 : 0);

const toJson = (v?: object | null): string | null =>
  v != null ? JSON.stringify(v) : null;

// ---------------------------------------------------------------------------
// 6. Per-collection migration functions
// ---------------------------------------------------------------------------

async function migrateSuras(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('Sura').find({}).lean<ISura[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO suras
      (id, sura_number, name, arabic_name, description, ayath_count, place,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @sura_number, @name, @arabic_name, @description, @ayath_count, @place,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const run = db.transaction((rows: ISura[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        sura_number: d.suraNumber,
        name: d.name,
        arabic_name: d.arabicName ?? null,
        description: d.description ?? null,
        ayath_count: d.ayathCount,
        place: d.place,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migrateTranslations(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('Translation').find({}).lean<ITranslation[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO translations
      (id, sura_number, aya_range_start, aya_range_end, language, translation_text,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @sura_number, @aya_range_start, @aya_range_end, @language, @translation_text,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const run = db.transaction((rows: ITranslation[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        sura_number: d.suraNumber,
        aya_range_start: d.ayaRangeStart,
        aya_range_end: d.ayaRangeEnd,
        language: d.language,
        translation_text: d.translationText,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migrateInterpretations(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('Interpretation').find({}).lean<IInterpretation[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO interpretations
      (id, sura_number, aya_range_start, aya_range_end, interpretation_number,
       language, interpretation_text,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @sura_number, @aya_range_start, @aya_range_end, @interpretation_number,
       @language, @interpretation_text,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const run = db.transaction((rows: IInterpretation[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        sura_number: d.suraNumber,
        aya_range_start: d.ayaRangeStart,
        aya_range_end: d.ayaRangeEnd,
        interpretation_number: d.interpretationNumber,
        language: d.language,
        interpretation_text: d.interpretationText,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migrateAboutUs(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('AboutUs').find({}).lean<IAboutUs[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO about_us
      (id, title, description,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @title, @description,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const run = db.transaction((rows: IAboutUs[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        title: d.title,
        description: d.description,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migrateAuthors(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('Author').find({}).lean<IAuthor[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO authors
      (id, html_content,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @html_content,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const run = db.transaction((rows: IAuthor[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        html_content: d.htmlContent,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migrateContactUs(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('ContactUs').find({}).lean<IContactUs[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO contact_us
      (id, mobile, whatsapp, email, address, remarks,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @mobile, @whatsapp, @email, @address, @remarks,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const run = db.transaction((rows: IContactUs[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        mobile: d.mobile ?? null,
        whatsapp: d.whatsapp ?? null,
        email: d.email ?? null,
        address: d.address ?? null,
        remarks: d.remarks ?? null,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migrateHelp(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('Help').find({}).lean<IHelp[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO help
      (id, title, description, icon, sort_order,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @title, @description, @icon, @sort_order,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const run = db.transaction((rows: IHelp[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        title: d.title,
        description: d.description,
        icon: d.icon ?? null,
        sort_order: d.order ?? 0,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migrateUsers(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('User').find({}).lean<IUser[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users
      (id, login_code, role, last_login, login_count, is_active, created_at, updated_at)
    VALUES
      (@id, @login_code, @role, @last_login, @login_count, @is_active, @created_at, @updated_at)
  `);

  const run = db.transaction((rows: IUser[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        login_code: d.loginCode,
        role: d.role,
        last_login: toIso(d.lastLogin),
        login_count: d.loginCount,
        is_active: toBool(d.isActive),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

async function migratePageHandlers(
  db: BetterSQLite3Database
): Promise<{ handlers: number; entries: number }> {
  const docs = await mongoose.model('PageHandler').find({}).lean<IPageHandler[]>();

  const handlerStmt = db.prepare(`
    INSERT OR REPLACE INTO page_handlers
      (id, page_no,
       created_by, created_by_role, verified_by, verified_at, is_verified,
       created_at, updated_at)
    VALUES
      (@id, @page_no,
       @created_by, @created_by_role, @verified_by, @verified_at, @is_verified,
       @created_at, @updated_at)
  `);

  const entryStmt = db.prepare(`
    INSERT INTO page_handler_entries
      (page_handler_id, surah_number, ayah_from, ayah_to, block_from, block_to)
    VALUES
      (@page_handler_id, @surah_number, @ayah_from, @ayah_to, @block_from, @block_to)
  `);

  let totalEntries = 0;

  const run = db.transaction((rows: IPageHandler[]) => {
    for (const d of rows) {
      const handlerId = d._id.toString();

      handlerStmt.run({
        id: handlerId,
        page_no: d.pageNo,
        created_by: d.createdBy,
        created_by_role: d.createdByRole,
        verified_by: d.verifiedBy ?? null,
        verified_at: toIso(d.verifiedAt),
        is_verified: toBool(d.isVerified),
        created_at: toIso(d.createdAt)!,
        updated_at: toIso(d.updatedAt)!,
      });

      const entries = d.entries ?? [];
      for (const e of entries) {
        entryStmt.run({
          page_handler_id: handlerId,
          surah_number: e.surahNumber,
          ayah_from: e.ayahFrom,
          ayah_to: e.ayahTo,
          block_from: e.blockFrom,
          block_to: e.blockTo,
        });
        totalEntries++;
      }
    }
  });

  run(docs);
  return { handlers: docs.length, entries: totalEntries };
}

async function migrateAuditLogs(db: BetterSQLite3Database): Promise<number> {
  const docs = await mongoose.model('AuditLog').find({}).lean<IAuditLog[]>();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO audit_logs
      (id, content_type, content_id, action, performed_by, role,
       details, previous_data, new_data, created_at)
    VALUES
      (@id, @content_type, @content_id, @action, @performed_by, @role,
       @details, @previous_data, @new_data, @created_at)
  `);

  const run = db.transaction((rows: IAuditLog[]) => {
    for (const d of rows) {
      stmt.run({
        id: d._id.toString(),
        content_type: d.contentType,
        content_id: d.contentId,
        action: d.action,
        performed_by: d.performedBy,
        role: d.role,
        details: d.details ?? null,
        previous_data: toJson(d.previousData),
        new_data: toJson(d.newData),
        created_at: toIso(d.createdAt)!,
      });
    }
  });

  run(docs);
  return docs.length;
}

// ---------------------------------------------------------------------------
// 7. Verification — compare MongoDB counts vs SQLite counts
// ---------------------------------------------------------------------------

async function verifyMigration(db: BetterSQLite3Database) {
  console.log('\n─────────────────────────────────────────────────');
  console.log('  VERIFICATION — MongoDB vs SQLite row counts');
  console.log('─────────────────────────────────────────────────');

  const checks: Array<{ label: string; sqliteTable: string; mongoModel: string }> = [
    { label: 'Suras',              sqliteTable: 'suras',               mongoModel: 'Sura' },
    { label: 'Translations',       sqliteTable: 'translations',        mongoModel: 'Translation' },
    { label: 'Interpretations',    sqliteTable: 'interpretations',     mongoModel: 'Interpretation' },
    { label: 'AboutUs',            sqliteTable: 'about_us',            mongoModel: 'AboutUs' },
    { label: 'Authors',            sqliteTable: 'authors',             mongoModel: 'Author' },
    { label: 'ContactUs',          sqliteTable: 'contact_us',          mongoModel: 'ContactUs' },
    { label: 'Help',               sqliteTable: 'help',                mongoModel: 'Help' },
    { label: 'Users',              sqliteTable: 'users',               mongoModel: 'User' },
    { label: 'PageHandlers',       sqliteTable: 'page_handlers',       mongoModel: 'PageHandler' },
    { label: 'AuditLogs',          sqliteTable: 'audit_logs',          mongoModel: 'AuditLog' },
  ];

  let allPassed = true;

  for (const { label, sqliteTable, mongoModel } of checks) {
    const mongoCount = await mongoose.model(mongoModel).countDocuments();
    const sqliteCount = (
      db.prepare(`SELECT COUNT(*) AS cnt FROM ${sqliteTable}`).get() as { cnt: number }
    ).cnt;

    const status = mongoCount === sqliteCount ? '✔' : '✖';
    if (mongoCount !== sqliteCount) allPassed = false;

    console.log(
      `  ${status}  ${label.padEnd(20)} MongoDB: ${String(mongoCount).padStart(6)}  │  SQLite: ${String(sqliteCount).padStart(6)}`
    );
  }

  // PageHandler entries — derive expected count from MongoDB
  const phDocs = await mongoose
    .model('PageHandler')
    .aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: { $size: '$entries' } } } }]);
  const expectedEntries = phDocs[0]?.total ?? 0;
  const actualEntries = (
    db.prepare('SELECT COUNT(*) AS cnt FROM page_handler_entries').get() as { cnt: number }
  ).cnt;
  const entryStatus = expectedEntries === actualEntries ? '✔' : '✖';
  if (expectedEntries !== actualEntries) allPassed = false;

  console.log(
    `  ${entryStatus}  ${'PageHandler Entries'.padEnd(20)} MongoDB: ${String(expectedEntries).padStart(6)}  │  SQLite: ${String(actualEntries).padStart(6)}`
  );

  console.log('─────────────────────────────────────────────────');
  if (allPassed) {
    console.log('  ✔  All counts match. Migration is complete and verified.');
  } else {
    console.error('  ✖  Count mismatch detected! Please review the errors above.');
    process.exitCode = 1;
  }
  console.log('─────────────────────────────────────────────────\n');
}

// ---------------------------------------------------------------------------
// 8. Main entry point
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Quran Malayalam — MongoDB → SQLite Migration');
  console.log('═══════════════════════════════════════════════════\n');

  // Connect to MongoDB
  console.log('⏳  Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  console.log('✔  Connected to MongoDB\n');

  // Register all models
  registerModels();

  // Open / create SQLite database
  if (fs.existsSync(SQLITE_OUTPUT_PATH)) {
    fs.unlinkSync(SQLITE_OUTPUT_PATH);
    console.log(`✔  Removed existing database at ${SQLITE_OUTPUT_PATH}`);
  }
  const db = new Database(SQLITE_OUTPUT_PATH);
  console.log(`✔  SQLite database created at ${SQLITE_OUTPUT_PATH}\n`);

  // Create schema
  createSQLiteSchema(db);
  console.log('✔  SQLite schema created (all tables + indexes)\n');

  // Migrate each collection
  console.log('⏳  Migrating collections…\n');

  const suraCount = await migrateSuras(db);
  console.log(`  ✔  Suras               → ${suraCount} rows`);

  const translationCount = await migrateTranslations(db);
  console.log(`  ✔  Translations        → ${translationCount} rows`);

  const interpretationCount = await migrateInterpretations(db);
  console.log(`  ✔  Interpretations     → ${interpretationCount} rows`);

  const aboutUsCount = await migrateAboutUs(db);
  console.log(`  ✔  AboutUs             → ${aboutUsCount} rows`);

  const authorCount = await migrateAuthors(db);
  console.log(`  ✔  Authors             → ${authorCount} rows`);

  const contactUsCount = await migrateContactUs(db);
  console.log(`  ✔  ContactUs           → ${contactUsCount} rows`);

  const helpCount = await migrateHelp(db);
  console.log(`  ✔  Help                → ${helpCount} rows`);

  const userCount = await migrateUsers(db);
  console.log(`  ✔  Users               → ${userCount} rows`);

  const { handlers: phCount, entries: phEntries } = await migratePageHandlers(db);
  console.log(`  ✔  PageHandlers        → ${phCount} rows  (+ ${phEntries} entries)`);

  const auditCount = await migrateAuditLogs(db);
  console.log(`  ✔  AuditLogs           → ${auditCount} rows`);

  // Verification
  await verifyMigration(db);

  // Cleanup
  db.close();
  await mongoose.disconnect();

  const stats = fs.statSync(SQLITE_OUTPUT_PATH);
  const sizeMb = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`✔  Database closed. File size: ${sizeMb} MB`);
  console.log(`✔  Output: ${SQLITE_OUTPUT_PATH}`);
  console.log('\n═══════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('\n✖  Migration failed:', err);
  process.exit(1);
});
