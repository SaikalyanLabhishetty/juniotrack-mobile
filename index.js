const { registerBackgroundHandler } = require("./services/notifications/background");

registerBackgroundHandler();

require("expo-router/entry");
