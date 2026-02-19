const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "MedSearch API", version: "1.0.0" },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    paths: {
      "/api/health": {
        get: {
          summary: "Health check",
          responses: {
            200: { description: "OK" }
          }
        }
      },

      "/api/auth/register": {
        post: {
          summary: "Register",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Bad Request" }
          }
        }
      },

      "/api/auth/login": {
        post: {
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "OK" },
            400: { description: "Bad Request" }
          }
        }
      },

      "/api/auth/me": {
        get: {
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" },
            401: { description: "Unauthorized" }
          }
        }
      },

      "/api/pharmacies": {
        get: {
          summary: "Get pharmacies (list)",
          responses: {
            200: { description: "OK" }
          }
        }
      },

      "/api/pharmacies/search": {
        get: {
          summary: "Search pharmacies",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: { description: "OK" }
          }
        }
      },

      "/api/pharmacies/{id}": {
        get: {
          summary: "Get pharmacy by id",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: { description: "OK" },
            404: { description: "Not found" }
          }
        }
      },

    }
  },
  apis: []
};

module.exports = swaggerJSDoc(options);
