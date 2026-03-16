const swaggerJSDoc = require("swagger-jsdoc");

const jsonRequestBody = ({ required = [], properties = {}, example = {} }) => ({
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required,
        properties
      },
      example
    }
  }
});

const jsonResponse = (description) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object"
      }
    }
  }
});

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "MedSearch API", version: "1.0.0" },
    servers: [{ url: "http://localhost:5000" }],
    tags: [
      { name: "Auth", description: "Public authentication endpoints" },
      { name: "Admin Auth", description: "Admin authentication endpoints" },
      { name: "Admin Users", description: "Admin user management" },
      { name: "Pharmacies", description: "Pharmacy endpoints" },
      { name: "Admin Pharmacies", description: "Admin pharmacy management" },
      { name: "Medicines", description: "Admin medicine management" },
      { name: "Reservations", description: "Reservation endpoints" },
      { name: "Admin Reservations", description: "Admin reservation management" },
      { name: "Reminders", description: "Admin reminder management" },
      { name: "Support", description: "Support conversation endpoints" },
      { name: "Settings", description: "Admin settings endpoints" }
    ],
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
          tags: ["Auth"],
          requestBody: jsonRequestBody({
            required: ["name", "email", "password"],
            properties: {
              name: { type: "string", example: "Aylin Mammadova" },
              email: { type: "string", format: "email", example: "aylin@example.com" },
              password: { type: "string", format: "password", example: "Password123" }
            },
            example: {
              name: "Aylin Mammadova",
              email: "aylin@example.com",
              password: "Password123"
            }
          }),
          responses: {
            201: jsonResponse("Created"),
            400: jsonResponse("Bad Request")
          }
        }
      },

      "/api/auth/login": {
        post: {
          summary: "Login",
          tags: ["Auth"],
          requestBody: jsonRequestBody({
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email", example: "user@example.com" },
              password: { type: "string", format: "password", example: "Password123" }
            },
            example: {
              email: "user@example.com",
              password: "Password123"
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad Request"),
            429: jsonResponse("Too many requests")
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
          tags: ["Admin Auth"],
          requestBody: jsonRequestBody({
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email", example: "admin@example.com" },
              password: { type: "string", format: "password", example: "Password123" }
            },
            example: {
              email: "admin@example.com",
              password: "Password123"
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            403: jsonResponse("Admin access required"),
            429: jsonResponse("Too many requests")
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
          tags: ["Admin Pharmacies"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: jsonResponse("OK")
          }
        },
        post: {
          summary: "Create pharmacy",
          tags: ["Admin Pharmacies"],
          security: [{ bearerAuth: [] }],
          requestBody: jsonRequestBody({
            required: ["name"],
            properties: {
              name: { type: "string", example: "CityCare Pharmacy" },
              ownerId: { type: "string", example: "65f0b17a5c0f31ef9b45d201", nullable: true },
              address: { type: "string", example: "28 May Street 14, Baku" },
              phone: { type: "string", example: "+994124041010" },
              email: { type: "string", format: "email", example: "citycare@example.com" },
              mapLink: { type: "string", example: "https://maps.example.com/citycare" },
              status: { type: "string", enum: ["ACTIVE", "INACTIVE", "PENDING"], example: "ACTIVE" },
              openingHours: { type: "string", example: "08:00 - 22:00" },
              notes: { type: "string", example: "Main downtown branch." }
            },
            example: {
              name: "CityCare Pharmacy",
              ownerId: "65f0b17a5c0f31ef9b45d201",
              address: "28 May Street 14, Baku",
              phone: "+994124041010",
              email: "citycare@example.com",
              mapLink: "https://maps.example.com/citycare",
              status: "ACTIVE",
              openingHours: "08:00 - 22:00",
              notes: "Main downtown branch."
            }
          }),
          responses: {
            201: jsonResponse("Created"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden")
          }
        }
      },
      "/api/admin/pharmacies/{pharmacyId}": {
        patch: {
          summary: "Update pharmacy",
          tags: ["Admin Pharmacies"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "pharmacyId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: jsonRequestBody({
            properties: {
              name: { type: "string", example: "CityCare Pharmacy Updated" },
              ownerId: { type: "string", example: "65f0b17a5c0f31ef9b45d201", nullable: true },
              address: { type: "string", example: "Nizami Street 50, Baku" },
              phone: { type: "string", example: "+994124041011" },
              email: { type: "string", format: "email", example: "branch@example.com" },
              mapLink: { type: "string", example: "https://maps.example.com/citycare-updated" },
              status: { type: "string", enum: ["ACTIVE", "INACTIVE", "PENDING"], example: "ACTIVE" },
              openingHours: { type: "string", example: "09:00 - 21:00" },
              notes: { type: "string", example: "Renovated branch." }
            },
            example: {
              address: "Nizami Street 50, Baku",
              phone: "+994124041011",
              openingHours: "09:00 - 21:00",
              notes: "Renovated branch."
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden"),
            404: jsonResponse("Not found")
          }
        }
      },
      "/api/admin/medicines": {
        get: {
          summary: "Admin medicines list",
          tags: ["Medicines"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: jsonResponse("OK")
          }
        },
        post: {
          summary: "Create medicine",
          tags: ["Medicines"],
          security: [{ bearerAuth: [] }],
          requestBody: jsonRequestBody({
            required: ["name", "pharmacyId"],
            properties: {
              name: { type: "string", example: "Ibuprofen 200mg" },
              category: { type: "string", example: "Pain Relief" },
              description: {
                type: "string",
                example: "NSAID tablets for fever and mild pain management."
              },
              manufacturer: { type: "string", example: "Abbott" },
              dosageForm: { type: "string", example: "Tablet" },
              strength: { type: "string", example: "200mg" },
              price: { type: "number", example: 6.2 },
              stock: { type: "number", example: 120 },
              pharmacyId: { type: "string", example: "65f0b17a5c0f31ef9b45d301" },
              requiresPrescription: { type: "boolean", example: false },
              isActive: { type: "boolean", example: true }
            },
            example: {
              name: "Ibuprofen 200mg",
              category: "Pain Relief",
              description: "NSAID tablets for fever and mild pain management.",
              manufacturer: "Abbott",
              dosageForm: "Tablet",
              strength: "200mg",
              price: 6.2,
              stock: 120,
              pharmacyId: "65f0b17a5c0f31ef9b45d301",
              requiresPrescription: false,
              isActive: true
            }
          }),
          responses: {
            201: jsonResponse("Created"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden")
          }
        }
      },
      "/api/admin/medicines/{medicineId}": {
        patch: {
          summary: "Update medicine",
          tags: ["Medicines"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "medicineId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: jsonRequestBody({
            properties: {
              name: { type: "string", example: "Ibuprofen 400mg" },
              category: { type: "string", example: "Pain Relief" },
              description: { type: "string", example: "Updated description." },
              manufacturer: { type: "string", example: "Abbott" },
              dosageForm: { type: "string", example: "Tablet" },
              strength: { type: "string", example: "400mg" },
              price: { type: "number", example: 7.5 },
              stock: { type: "number", example: 95 },
              pharmacyId: { type: "string", example: "65f0b17a5c0f31ef9b45d301" },
              requiresPrescription: { type: "boolean", example: false },
              isActive: { type: "boolean", example: true }
            },
            example: {
              strength: "400mg",
              price: 7.5,
              stock: 95
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden"),
            404: jsonResponse("Not found")
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
          tags: ["Reminders"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: jsonResponse("OK")
          }
        },
        post: {
          summary: "Create reminder",
          tags: ["Reminders"],
          security: [{ bearerAuth: [] }],
          requestBody: jsonRequestBody({
            required: ["userId", "title", "scheduledAt"],
            properties: {
              userId: { type: "string", example: "65f0b17a5c0f31ef9b45d101" },
              medicineId: { type: "string", example: "65f0b17a5c0f31ef9b45d401", nullable: true },
              title: { type: "string", example: "Morning antibiotic dose" },
              dose: { type: "string", example: "1 capsule after breakfast" },
              scheduledAt: {
                type: "string",
                format: "date-time",
                example: "2026-03-16T08:00:00.000Z"
              },
              channel: { type: "string", enum: ["PUSH", "EMAIL", "SMS", "IN_APP"], example: "PUSH" },
              isEnabled: { type: "boolean", example: true },
              lastSentAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2026-03-15T08:00:00.000Z"
              }
            },
            example: {
              userId: "65f0b17a5c0f31ef9b45d101",
              medicineId: "65f0b17a5c0f31ef9b45d401",
              title: "Morning antibiotic dose",
              dose: "1 capsule after breakfast",
              scheduledAt: "2026-03-16T08:00:00.000Z",
              channel: "PUSH",
              isEnabled: true,
              lastSentAt: null
            }
          }),
          responses: {
            201: jsonResponse("Created"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden")
          }
        }
      },
      "/api/admin/reminders/{reminderId}": {
        patch: {
          summary: "Update reminder",
          tags: ["Reminders"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "reminderId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: jsonRequestBody({
            properties: {
              userId: { type: "string", example: "65f0b17a5c0f31ef9b45d101" },
              medicineId: { type: "string", example: "65f0b17a5c0f31ef9b45d401", nullable: true },
              title: { type: "string", example: "Evening follow-up dose" },
              dose: { type: "string", example: "1 tablet after dinner" },
              scheduledAt: {
                type: "string",
                format: "date-time",
                example: "2026-03-16T18:30:00.000Z"
              },
              channel: { type: "string", enum: ["PUSH", "EMAIL", "SMS", "IN_APP"], example: "IN_APP" },
              isEnabled: { type: "boolean", example: false },
              lastSentAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2026-03-15T18:30:00.000Z"
              }
            },
            example: {
              isEnabled: false,
              channel: "IN_APP"
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden"),
            404: jsonResponse("Not found")
          }
        }
      },
      "/api/support": {
        post: {
          summary: "Create support conversation",
          tags: ["Support"],
          security: [{ bearerAuth: [] }],
          requestBody: jsonRequestBody({
            required: ["subject", "message"],
            properties: {
              subject: { type: "string", example: "Prescription verification for Amoxicillin" },
              message: {
                type: "string",
                example: "I uploaded my prescription but my order is still pending."
              },
              priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], example: "HIGH" }
            },
            example: {
              subject: "Prescription verification for Amoxicillin",
              message: "I uploaded my prescription but my order is still pending.",
              priority: "HIGH"
            }
          }),
          responses: {
            201: jsonResponse("Created"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized")
          }
        },
        get: {
          summary: "Admin support conversations list",
          tags: ["Support"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: jsonResponse("OK")
          }
        }
      },
      "/api/support/{conversationId}/reply": {
        post: {
          summary: "Reply to support conversation as admin",
          tags: ["Support"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "conversationId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: jsonRequestBody({
            required: ["message"],
            properties: {
              message: {
                type: "string",
                example: "We are reviewing it now and will update you shortly."
              }
            },
            example: {
              message: "We are reviewing it now and will update you shortly."
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden"),
            404: jsonResponse("Not found")
          }
        }
      },
      "/api/support/{conversationId}/status": {
        patch: {
          summary: "Update support conversation status",
          tags: ["Support"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "conversationId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: jsonRequestBody({
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["OPEN", "PENDING", "RESOLVED"], example: "RESOLVED" }
            },
            example: {
              status: "RESOLVED"
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden"),
            404: jsonResponse("Not found")
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
          tags: ["Settings"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: jsonResponse("OK")
          }
        },
        patch: {
          summary: "Update admin settings",
          tags: ["Settings"],
          security: [{ bearerAuth: [] }],
          requestBody: jsonRequestBody({
            properties: {
              general: {
                type: "object",
                properties: {
                  platformName: { type: "string", example: "MedSearch Admin" },
                  supportEmail: { type: "string", format: "email", example: "support@example.com" },
                  supportPhone: { type: "string", example: "+994129990011" },
                  timezone: { type: "string", example: "Asia/Baku" },
                  maintenanceMode: { type: "boolean", example: false }
                }
              },
              notifications: {
                type: "object",
                properties: {
                  emailEnabled: { type: "boolean", example: true },
                  pushEnabled: { type: "boolean", example: true },
                  reservationAlerts: { type: "boolean", example: true },
                  reminderAlerts: { type: "boolean", example: true }
                }
              },
              email: {
                type: "object",
                properties: {
                  fromName: { type: "string", example: "MedSearch Support" },
                  fromAddress: { type: "string", format: "email", example: "no-reply@example.com" },
                  replyTo: { type: "string", format: "email", example: "support@example.com" },
                  provider: { type: "string", example: "smtp" }
                }
              },
              security: {
                type: "object",
                properties: {
                  sessionTtlHours: { type: "number", example: 168 },
                  passwordMinLength: { type: "number", example: 8 },
                  require2faForAdmins: { type: "boolean", example: false },
                  allowNewAdminRegistration: { type: "boolean", example: false }
                }
              }
            },
            example: {
              general: {
                platformName: "MedSearch Admin",
                supportEmail: "support@example.com",
                supportPhone: "+994129990011",
                timezone: "Asia/Baku",
                maintenanceMode: false
              },
              notifications: {
                emailEnabled: true,
                pushEnabled: true,
                reservationAlerts: true,
                reminderAlerts: true
              },
              email: {
                fromName: "MedSearch Support",
                fromAddress: "no-reply@example.com",
                replyTo: "support@example.com",
                provider: "smtp"
              },
              security: {
                sessionTtlHours: 168,
                passwordMinLength: 8,
                require2faForAdmins: false,
                allowNewAdminRegistration: false
              }
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden")
          }
        }
      },
      "/api/admin/users/{userId}": {
        patch: {
          summary: "Update user",
          tags: ["Admin Users"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: jsonRequestBody({
            properties: {
              name: { type: "string", example: "Updated User" },
              phone: { type: "string", example: "+994501234567" },
              role: { type: "string", enum: ["ADMIN", "PHARMACY_OWNER", "USER"], example: "USER" },
              status: { type: "string", enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], example: "ACTIVE" }
            },
            example: {
              name: "Updated User",
              phone: "+994501234567",
              status: "ACTIVE"
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden"),
            404: jsonResponse("Not found")
          }
        }
      },
      "/api/admin/reservations/{reservationId}/status": {
        patch: {
          summary: "Update reservation status as admin",
          tags: ["Admin Reservations"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "reservationId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: jsonRequestBody({
            required: ["status"],
            properties: {
              status: {
                type: "string",
                enum: ["ACTIVE", "COMPLETED", "CANCELLED", "PENDING", "Aktiv", "Tamamlandı", "Ləğv edildi"],
                example: "COMPLETED"
              }
            },
            example: {
              status: "COMPLETED"
            }
          }),
          responses: {
            200: jsonResponse("OK"),
            400: jsonResponse("Bad request"),
            401: jsonResponse("Unauthorized"),
            403: jsonResponse("Forbidden"),
            404: jsonResponse("Not found")
          }
        }
      },

    }
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJSDoc(options);
