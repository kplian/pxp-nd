import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import {WordKey, Translate, Language } from '@pxp-nd/entities';
import axios from 'axios';

@EventSubscriber()
export class WordKeySubscriber implements EntitySubscriberInterface<WordKey> {

    listenTo() {
        return WordKey;
    }

    async afterInsert(event: InsertEvent<WordKey>) {
      const wordKey = event.entity;  
      const [langs, countLangs] = await event.manager.findAndCount(Language, {where: {isActive: true}});
      const translateUrl = (lang: string, text: string) => 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20170606T185752Z.72aa1b413023beed.315f7dfc0e2db9db2038b567c99f1fcd66c32fd9&lang=' + lang + '&text=' + text;

      const yandexTranslates = langs.map( lang => axios.get(translateUrl(lang.code, wordKey.defaultText))); 
      // const translatesAll = Promise.all(yandexTranslates).then(console.log).catch(console.log);
      // console.log(translatesAll[0].data);
      
      const translates = langs.map((lang )=> (
        {
          text: wordKey.defaultText,
          wordId: wordKey.wordKeyId,
          state: 'AUTO',
          languageId: lang.languageId,
        }
      ));      
      await event.manager.save(Translate, translates);
    }
}