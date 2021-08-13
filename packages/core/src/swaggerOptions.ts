
const options = {
  "swaggerDefinition": {
    "openapi": "3.0.0",
    "info": {
      "title": "PXP ND API",
      "version": "1.1.0",
      "description": "This is a REST API application made with Express."
    },
    "servers": [
      {
        "url": "http://localhost:" + (process.env.PORT || 3200),
        "description": "Api"
      }
    ]
  },
  "apis": ["./src/routes/*.ts"]
}
export default options;