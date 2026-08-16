const { supabase, getClient } = require('./client');
const subscriptionService = require('./subscriptionService');
const guildSettingsService = require('./guildSettingsService');
const campaignService = require('./campaignService');
const userTemplateService = require('./userTemplateService');
const giveawayService = require('./giveawayService');
const dropService = require('./dropService');
const userService = require('./userService');

module.exports = {
  supabase,
  getClient,
  ...subscriptionService,
  ...guildSettingsService,
  ...campaignService,
  ...userTemplateService,
  ...giveawayService,
  ...dropService,
  ...userService
};

