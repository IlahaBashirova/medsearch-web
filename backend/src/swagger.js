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
      "/api/admin/auth/login": {
        post: {
          summary: "Admin login",
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
            403: { description: "Admin access required" }
          }
        }
      },
      "/api/admin/dashboard": {
        get: {
          summary: "Admin dashboard overview",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" },
            401: { description: "Unauthorized" }
          }
        }
      },
      "/api/admin/users": {
        get: {
          summary: "Admin users list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        }
      },
      "/api/admin/pharmacies": {
        get: {
          summary: "Admin pharmacies list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        },
        post: {
          summary: "Create pharmacy",
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: "Created" }
          }
        }
      },
      "/api/admin/medicines": {
        get: {
          summary: "Admin medicines list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        },
        post: {
          summary: "Create medicine",
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: "Created" }
          }
        }
      },
      "/api/admin/reservations": {
        get: {
          summary: "Admin reservations list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        }
      },
      "/api/admin/reminders": {
        get: {
          summary: "Admin reminders list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        },
        post: {
          summary: "Create reminder",
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: "Created" }
          }
        }
      },
      "/api/support": {
        post: {
          summary: "Create support conversation",
          responses: {
            201: { description: "Created" }
          }
        },
        get: {
          summary: "Admin support conversations list",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        }
      },
      "/api/admin/analytics": {
        get: {
          summary: "Admin analytics overview",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        }
      },
      "/api/admin/settings": {
        get: {
          summary: "Get admin settings",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        },
        patch: {
          summary: "Update admin settings",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OK" }
          }
        }
      },

    }
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJSDoc(options);
