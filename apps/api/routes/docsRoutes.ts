import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi";

const router = Router();

router.get("/openapi.json", (req, res) => {
  res.json(openApiDocument);
});
router.use("/", swaggerUi.serve, swaggerUi.setup(openApiDocument));

export default router;
