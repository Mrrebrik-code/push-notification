const { createClient } = require('@supabase/supabase-js');

module.exports = class Database{
    constructor(urlSupabase, anonPublicApiKey){
        this.supabase = createClient(urlSupabase, anonPublicApiKey);

        console.log("init database!");
    }

    async createPushNotification(idUser, url, messages, date){
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
                    body: messages.body
                },
                date: date
            }
        ]);

        return Boolean(user.data.length);
    }

    async getPushNotification(){
        let supabase = this.supabase;

        let user = await supabase
        .from('push')
        .select('idUser, image, message, date');

        return user.data;
    }
}