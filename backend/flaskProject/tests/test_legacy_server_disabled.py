import unittest

from app import app


class LegacyServerDisabledTest(unittest.TestCase):
    def test_legacy_endpoints_are_retired(self):
        response = app.test_client().get("/all-customers")

        self.assertEqual(response.status_code, 410)
        self.assertIn("retired", response.get_json()["error"].lower())


if __name__ == "__main__":
    unittest.main()
