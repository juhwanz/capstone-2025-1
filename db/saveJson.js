export function saveHistoryToJson(db) {
  db.all("SELECT * FROM history ORDER BY timestamp DESC", (err, rows) => {
    if (err) return;

    const fieldsToParse = [
      "keywordsRule",
      "keywordsGPT",
      "keywordsKIWI",
      "hormoneRule",
      "hormoneGPT",
      "hormoneKIWI",
      "nutrientsRule",
      "nutrientsGPT",
      "nutrientsKIWI",
      "foodsRule",
      "foodsGPT",
      "foodsKIWI",
    ];

    const safeRows = rows.map((row) => {
      const parsedRow = { ...row };
      for (const field of fieldsToParse) {
        try {
          parsedRow[field] = JSON.parse(row[field]);
        } catch {
          parsedRow[field] = [];
        }
      }
      return parsedRow;
    });

    fs.writeFileSync(
      path.join(process.cwd(), "history.json"),
      JSON.stringify(safeRows, null, 2),
      "utf-8"
    );
  });
}
