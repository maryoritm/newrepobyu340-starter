router.get("/trigger-error", (req, res, next) => {
    try {
      // Error intencional
      throw new Error("Intentional 500 Error Triggered");
    } catch (error) {
      next(error);
    }
  });