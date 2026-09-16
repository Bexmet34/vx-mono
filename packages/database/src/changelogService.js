const { getClient } = require('./client');

async function getChangelogs() {
    const supabase = getClient();
    const { data: changelogs, error } = await supabase
        .from('changelogs')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return changelogs;
}

async function addChangelog({ version, title, content, type }) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('changelogs')
        .insert([{ version, title, content, type }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

module.exports = {
    getChangelogs,
    addChangelog
};
