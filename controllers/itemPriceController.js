// itemPriceController.js
const db = require('../db');

exports.getItemPrices = async (req, res) => {
    const query = `
    SELECT 
        i.*,
        pri.*,
        pre.*
        FROM
        item i
    JOIN
        price pri 
    ON
        i.itemcode = pri.itemcode
    JOIN
        premise pre
    ON
        pri.premiseid = pre.premiseid
    WHERE
        i.itemcode = $1 && pre.premiseid = $2
    `
};

exports.getItemSearch = async (req, res) => {
  const searchTerm = req.query.searchTerm;

  // Split the user's input into individual keywords (e.g. "susu dutch lady" → ["susu", "dutch", "lady"])
  const terms = searchTerm.split(/\s+/).filter(term => term.trim() !== '');

  // If there are no valid terms, return an empty result early
  if (terms.length === 0) {
    return res.status(200).json([]);
  }

  // Construct a dynamic SQL WHERE clause:
  // This makes: "itemname ILIKE $1 AND itemname ILIKE $2 AND ..." for each keyword
  const whereClauses = terms.map((_, i) => `itemname ILIKE $${i + 1}`).join(' AND ');

  // Prepare values for parameterized query to prevent SQL injection
  // Each term is wrapped with %...% to allow partial matching
  const values = terms.map(term => `%${term}%`);

  // Final query: all terms must be found in the itemname (in any order)
  const query = `
    SELECT 
      itemcode,
      itemname,
      itemimage
    FROM item
    WHERE ${whereClauses}
  `;

  try {
    // 🚀 Execute the query with the dynamically built values
    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    // ⚠️ Handle and log any error during database access
    console.error('Error fetching item search:', error.message);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};
