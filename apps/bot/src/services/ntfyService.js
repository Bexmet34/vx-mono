async function sendPaymentNotificationToNtfy(payment) {
    const planType = payment.plan_type === 'user' ? 'Bireysel Premium' : 'Sunucu Premium';
    const message = `🔔 Yeni Ödeme Bildirimi (Havale/EFT)

👤 Gönderen İsim: ${payment.sender_name || 'Bilinmiyor'}
📋 Açıklama Kodu: ${payment.description_code || '-'}
💰 Ücret: ${payment.amount || 0} ${payment.currency || 'TL'}
🏢 Sunucu ID: ${payment.guild_id || '-'}
👤 Kullanıcı ID: ${payment.user_id || '-'}
📦 Plan: ${planType} (${payment.duration_days || 0} Gün)
🏦 Hedef Banka: ${payment.target_bank || 'Bilinmiyor'}
🆔 İşlem ID: ${payment.id}
⏱️ Tarih: ${new Date().toLocaleString('tr-TR')}`;

    await fetch('https://ntfy.sh/veyronix', {
        method: 'POST',
        body: message,
        headers: {
            'Title': 'Yeni Odeme Talebi!',
            'Priority': 'high',
            'Tags': 'moneybag,bell'
        }
    }).catch(console.error);
}

module.exports = { sendPaymentNotificationToNtfy };
