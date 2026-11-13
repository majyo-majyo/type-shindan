(function(){
 'use strict';
 const base='https://majyo-majyo.github.io/type-shindan/';
 const groups=new Set(['nickname-maker','workplace-type','marriage-type','money-type','oshi-type','personality16-type']);
 function parts(group,key,variant){key=String(key).toLowerCase();variant=String(variant||'1');if(!groups.has(group)||!/^([a-z0-9]+)$/.test(key)||!['1','2'].includes(variant))throw new Error('Invalid result share key');return{group,key,variant};}
 function url(group,key,variant){const p=parts(group,key,variant);return base+'share/'+p.group+'/'+p.key+'-'+p.variant+'/';}
 function imageUrl(group,key,variant){const p=parts(group,key,variant);return base+'share/cards/'+p.group+'-'+p.key+'-'+p.variant+'.jpg';}
 function prepare(group,key,variant){
  const share=document.getElementById(group==='nickname-maker'?'share':'share-btn');if(!share)return;
  let download=document.getElementById('result-image-download');
  if(!download){download=document.createElement('a');download.id='result-image-download';download.className='result-image-download';download.textContent='結果画像を保存';share.after(download);}
  download.href=imageUrl(group,key,variant);download.download=String(key).toLowerCase()+'-type'+String(variant||'1')+'.jpg';
 }
 window.ResultSharing=Object.freeze({url,imageUrl,prepare});
})();
