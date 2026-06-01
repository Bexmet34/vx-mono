const { supabase, getClient } = require('./client');
const subscriptionService = require('./subscriptionService');
const guildSettingsService = require('./guildSettingsService');
const campaignService = require('./campaignService');

module.exports = {
  supabase,
  getClient,
  ...subscriptionService,
  ...guildSettingsService,
  ...campaignService
};
