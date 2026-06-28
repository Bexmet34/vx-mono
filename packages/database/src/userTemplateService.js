const { supabase } = require('./client');

/**
 * Add a new user template
 */
async function addUserTemplate(userId, templateName, header, description, rolesText) {
    try {
        const { data, error } = await supabase
            .from('user_templates')
            .insert({
                user_id: userId,
                template_name: templateName,
                party_header: header,
                party_description: description || '',
                party_roles: rolesText
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('[Supabase] Error adding user template:', err.message);
        return null;
    }
}

/**
 * Get all templates for a user
 */
async function getUserTemplates(userId) {
    try {
        const { data, error } = await supabase
            .from('user_templates')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('[Supabase] Error fetching user templates:', err.message);
        return [];
    }
}

/**
 * Delete a user template
 */
async function deleteUserTemplate(templateId, userId) {
    try {
        const { error } = await supabase
            .from('user_templates')
            .delete()
            .eq('id', templateId)
            .eq('user_id', userId); // Security check

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('[Supabase] Error deleting user template:', err.message);
        return false;
    }
}

/**
 * Update an existing user template
 */
async function updateUserTemplate(templateId, userId, updates) {
    try {
        const { error } = await supabase
            .from('user_templates')
            .update({
                template_name: updates.templateName,
                party_header: updates.header,
                party_description: updates.description || '',
                party_roles: updates.rolesText
            })
            .eq('id', templateId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('[Supabase] Error updating user template:', err.message);
        return false;
    }
}

/**
 * Get a specific template by ID
 */
async function getUserTemplateById(templateId, userId) {
    try {
        const { data, error } = await supabase
            .from('user_templates')
            .select('*')
            .eq('id', templateId)
            .eq('user_id', userId)
            .single();

        if (error) {
             if (error.code !== 'PGRST116') {
                 throw error;
             }
             return null;
        }
        return data;
    } catch (err) {
        console.error('[Supabase] Error fetching user template by ID:', err.message);
        return null;
    }
}


module.exports = {
    addUserTemplate,
    getUserTemplates,
    deleteUserTemplate,
    updateUserTemplate,
    getUserTemplateById
};
