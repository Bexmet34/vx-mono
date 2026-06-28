const { supabase, getClient } = require('./client');
const subscriptionService = require('./subscriptionService');
const guildSettingsService = require('./guildSettingsService');
const campaignService = require('./campaignService');
const userTemplateService = require('./userTemplateService');

module.exports = {
  supabase,
  getClient,
  ...subscriptionService,
  ...guildSettingsService,
  ...campaignService,
  ...userTemplateService
};
