import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Employee Management System API",
      version: "1.0.0",
      description: "REST API for managing employees, departments, and leave requests"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, "../routes/*.{ts,js}").split(path.sep).join("/")]
};

export const swaggerSpec = swaggerJsdoc(options);
