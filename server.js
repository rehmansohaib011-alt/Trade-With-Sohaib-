const http = require("http");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";

const DASH_TOKEN = process.env.DASH_TOKEN;
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY;

const ALLOWED_ORIGIN = "https://rehmansohaib011-alt.github.io";

function sendJson(res, status, data) {
  const body = JSON.stringify(data);

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, X-Token",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin"
  });

  res.end(body);
}

function makeSignature(query) {
  return crypto
    .createHmac("sha256", BINANCE_SECRET_KEY)
    .update(query)
    .digest("hex");
}

async function getBinancePositions() {
  const timestamp = Date.now();

  const query =
    `recvWindow=10000&timestamp=${timestamp}`;

  const signature = makeSignature(query);

  const url =
    `https://fapi.binance.com/fapi/v2/positionRisk?${query}&signature=${signature}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-MBX-APIKEY": BINANCE_API_KEY,
      "User-Agent": "Trade-With-Sohaib/1.0"
    }
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error("Binance request failed");
    error.status = response.status;
    error.binance = data;
    throw error;
  }

  if (!Array.isArray(data)) {
    const error = new Error("Unexpected Binance response");
    error.status = 502;
    error.binance = data;
    throw error;
  }

  return data;
}

function mapPosition(p) {
  const amount = Number(p.positionAmt || 0);
  const entryPrice = Number(p.entryPrice || 0);
  const markPrice = Number(p.markPrice || 0);

  return {
    id: `BINANCE-${p.symbol}-${p.positionSide || "BOTH"}`,
    s: p.symbol,
    sd: amount > 0 ? 1 : amount < 0 ? -1 : 0,
    lv: Number(p.leverage || 0),
    en: entryPrice,
    mg: Number(p.initialMargin || 0),
    u: Number(p.unRealizedProfit || 0),
    cp: markPrice,
    lp: Number(p.liquidationPrice || 0),
    ex: "BINANCE",
    size: Math.abs(amount),
    notional: Math.abs(Number(p.notional || amount * markPrice)),
    positionSide: p.positionSide || "BOTH",
    marginType: p.marginType || ""
  };
}

const server = http.createServer(async (req, res) => {

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Headers": "Content-Type, X-Token",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    });

    return res.end();
  }

  const url = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );

  if (url.pathname === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "trade-with-sohaib-binance-api"
    });
  }

  if (url.pathname !== "/" && url.pathname !== "/positions") {
    return sendJson(res, 404, {
      error: "Not found"
    });
  }

  if (
    !DASH_TOKEN ||
    !BINANCE_API_KEY ||
    !BINANCE_SECRET_KEY
  ) {
    return sendJson(res, 500, {
      error: "Server environment variables are not configured"
    });
  }

  const token = req.headers["x-token"];

  if (!token || token !== DASH_TOKEN) {
    return sendJson(res, 401, {
      error: "wrong token"
    });
  }

  try {

    const rawPositions = await getBinancePositions();

    const positions = rawPositions
      .filter(p => Number(p.positionAmt || 0) !== 0)
      .map(mapPosition);

    return sendJson(res, 200, {
      exchange: "BINANCE",
      positions,
      count: positions.length,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {

    return sendJson(res, error.status || 502, {
      error: "Binance request failed",
      httpStatus: error.status || 502,
      detail: error.binance || error.message
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(
    `Trade With Sohaib API listening on ${HOST}:${PORT}`
  );
});
