export const ERROR_MESSAGES = {
  CANT_VALIDATE_ORIGIN: `Can't validate origin! Please add ?_origin=PARENT_HOST to the iframe source.`,
  CANT_VALIDATE_PLACEMENT: `Can't validate placement! Please add ?_placement=PLACEMENT_NAME to the iframe source.`,
  CANT_USE_READY_COMMAND: `The 'ready' command is reserved.`,
  EMPTY_IFRAME: `No src found. You can't run ParentFrame on an empty iframe element.`,
  NOT_DEFINED_EVENT_NAME: `Can't send an undefined event name. Make sure you add your event name first.`,
  INVALID_MESSAGE_FORMAT: `The message format is invalid.`,
};

export default ERROR_MESSAGES;
