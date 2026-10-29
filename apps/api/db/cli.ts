import sequelize from "../config/database";
import logger from "../config/logger";
import { createMigrator, createSeeder } from "./migrator";

const USAGE = "usage: db <migrate|undo|undo-all|status|seed|reset>";

const commands: Record<string, () => Promise<void>> = {
  async migrate() {
    const applied = await createMigrator().up();
    logger.info({ applied: applied.map((m) => m.name) }, "Migrated");
  },
  async undo() {
    const reverted = await createMigrator().down();
    logger.info({ reverted: reverted.map((m) => m.name) }, "Reverted");
  },
  async "undo-all"() {
    const reverted = await createMigrator().down({ to: 0 });
    logger.info({ reverted: reverted.map((m) => m.name) }, "Reverted all");
  },
  async status() {
    const migrator = createMigrator();
    const [executed, pending] = await Promise.all([
      migrator.executed(),
      migrator.pending(),
    ]);
    executed.forEach((m) => console.log(`up    ${m.name}`));
    pending.forEach((m) => console.log(`down  ${m.name}`));
  },
  async seed() {
    const seeded = await createSeeder().up();
    logger.info({ seeded: seeded.map((s) => s.name) }, "Seeded");
  },
  async reset() {
    await commands["undo-all"]!();
    await commands.migrate!();
    await commands.seed!();
  },
};

const run = async () => {
  const command = commands[process.argv[2] ?? ""];
  if (!command) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  try {
    await command();
  } finally {
    await sequelize.close();
  }
};

run().catch((err) => {
  logger.error({ err }, "Database command failed");
  process.exitCode = 1;
});
