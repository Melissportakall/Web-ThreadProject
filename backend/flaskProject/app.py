from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
def retired_legacy_api(path: str):
    return jsonify({
        "error": "The legacy API has been retired. Use the authenticated /api/v1 API.",
    }), 410


if __name__ == "__main__":
    raise SystemExit("The legacy API is disabled. Start the application with wsgi:app.")
