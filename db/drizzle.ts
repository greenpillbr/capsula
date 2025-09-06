import { type ExpoSQLiteDatabase, drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import type { SQLJsDatabase } from "drizzle-orm/sql-js";

import migrations from "./migrations/migrations";

const expoDb = openDatabaseSync("database.db", { enableChangeListener: true });
const db = drizzle(expoDb);

export const initialize = (): Promise<ExpoSQLiteDatabase> => {
  return Promise.resolve(db);
};
export const useMigrationHelper = () => {
  return useMigrations(db, migrations);
};
