const { createClient } = require('@supabase/supabase-js');

module.exports = class Database{
    constructor(urlSupabase, anonPublicApiKey){
        this.supabase = createClient(urlSupabase, anonPublicApiKey);

        console.log("init database!");
    }

    async createPushNotification(idUser, url, messages, date, idNotification){
        let supabase = this.supabase;

        let user = await supabase
        .from('push')
        .insert(
        [ 
            { 
                idUser: idUser, 
                image: url,
                message: {
                    tittle: messages.tittle,
                    bodyRU: messages.bodyRU,
                    bodyEN: messages.bodyEN
                },
                date: date,
                idNotification: idNotification
            }
        ]);

        return Boolean(user.data.length);
    }

    async getPushNotification(){
        let supabase = this.supabase;

        let user = await supabase
        .from('push')
        .select('idUser, image, message, date, idNotification');

        return user.data;
    }

    async deleteNotificationAll(userId){
        let supabase = this.supabase;

        console.log(userId.toString())
        const chat = await supabase
         .from('push')
         .delete()
         .eq("idUser", userId.toString());
    }

    async deleteNotificationTarget(userId, idNotification){
        let supabase = this.supabase;

        const chat = await supabase
         .from('push')
         .delete()
         .eq("idUser", userId)
         .eq("idNotification", idNotification);
    }
}