const { logger } = require('../logger');

const ValidationService = {
  validateProperties(reqBody, reqProps) {
    // Get the keys array from the reqBody object
    const reqBodyKeys = Object.keys(reqBody);

    // Create the error object; if keys missing, add missing prop with missing keys
    const missingAndInvalidProps = reqProps.reduce((acc, key) => {
      if (!reqBodyKeys.includes(key)) {
        if (!acc.missing) {
          acc.missingReqProps = [];
        }
        acc.missingReqProps.push(key);
      }
      return acc;
    }, {});

    // Check if reqBody prop values are falsey or
    // if the 'rating' prop is a number between 0 and 5;
    // if so, add them to 'invalidProps' prop
    for (const [key, value] of Object.entries(reqBody)) {
      if (
        (!value) ||
        (key === "rating" && typeof value !== "number") ||
        (key === "rating" && (value < 0 || value > 5))
      ) {
        if (!missingAndInvalidProps.invalidProps) {
          missingAndInvalidProps.invalidProps = [];
        }
        missingAndInvalidProps.invalidProps.push(key);
      }
    }
    return missingAndInvalidProps;
  },
  reportValidationErrors(errorObject, res) {
    const {missingReqProps, invalidProps} = errorObject;
    if (missingReqProps) {
      logger.error(`Required properties are missing: ${missingReqProps.join(', ')}`);
    }
    if (invalidProps) {
      logger.error(`Invalid property values provided: ${invalidProps.join(', ')}`);
    }

    // Send 400 response and object with missing and/or invalid props
    return res
      .status(400)
      .json({error: errorObject})
  },
}

const validateProperties = (reqBody, reqProps) => {
  // Get the keys array from the reqBody object
  const reqBodyKeys = Object.keys(reqBody);

  // Create the error object; if keys missing, add missing prop with missing keys
  const missingAndInvalidProps = reqProps.reduce((acc, key) => {
    if (!reqBodyKeys.includes(key)) {
      if (!acc.missing) {
        acc.missingReqProps = [];
      }
      acc.missingReqProps.push(key);
    }
    return acc;
  }, {});

  // Check if reqBody prop values are falsey or
  // if the 'rating' prop is a number between 0 and 5;
  // if so, add them to 'invalidProps' prop
  for (const [key, value] of Object.entries(reqBody)) {
    if (
      (!value) ||
      (key === "rating" && typeof value !== "number") ||
      (key === "rating" && (value < 0 || value > 5))
    ) {
      if (!missingAndInvalidProps.invalidProps) {
        missingAndInvalidProps.invalidProps = [];
      }
      missingAndInvalidProps.invalidProps.push(key);
    }
  }
  return missingAndInvalidProps;
};

const reportValidationErrors = (errorObject, res) => {
    const {missingReqProps, invalidProps} = errorObject;
    if (missingReqProps) {
      logger.error(`Required properties are missing: ${missingReqProps.join(', ')}`);
    }
    if (invalidProps) {
      logger.error(`Invalid property values provided: ${invalidProps.join(', ')}`);
    }

    // Send 400 response and object with missing and/or invalid props
    return res
      .status(400)
      .json({error: errorObject})
};

module.exports = {
  validateProperties,
  reportValidationErrors,
  ValidationService
};
