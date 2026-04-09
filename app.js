// --- app.js ---
// All logic for the Wardrobe app.
// CMD+F section names to jump around:
//   SECTION 1-20 (see table of contents below)

'use strict';

// === SECTION 1: State ===
var state = {
  isDemo: false, accessToken: null, wardrobe: [], archive: [],
  currentVibe: 'work', todayOutfit: null, weather: null,
  calendarEvents: {}, planOutfits: {},
  closetFilter: 'all', closetSort: 'recent',
  detailItemWid: null, pickerCallback: null,
};

// === SECTION 2: Demo data (32 items from spreadsheet) ===
function getEmojiForType(t) {
  return {Top:'\u{1F455}',Bottom:'\u{1F456}',Outerwear:'\u{1F9E5}',Shoes:'\u{1F45E}',Accessory:'\u{1F48D}'}[t]||'\u{1F454}';
}
function parseRating(v) {
  if(!v||v==='NaN'||v==='undefined') return 0;
  var n=parseInt(v); return isNaN(n)?0:Math.max(0,Math.min(5,n));
}

var DEMO_ITEMS = [
{wid:'w_01',name:'Scoop Neck Elbow Sleeve Tee',brand:'Ann Taylor',color:'Black',size:'S Classic',type:'Top',use:'Work, Casual',season:'Year-round',rating:4,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/836938_2222?$pdpMainImage$',emoji:'\u{1F455}'},
{wid:'w_02',name:'Scoop Neck Elbow Sleeve Tee',brand:'Ann Taylor',color:'Winter White',size:'S Classic',type:'Top',use:'Work, Casual',season:'Year-round',rating:4,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/836938_9192?$pdpMainImage$',emoji:'\u{1F455}'},
{wid:'w_03',name:'Scoop Neck Elbow Sleeve Tee',brand:'Ann Taylor',color:'Night Sky',size:'S Classic',type:'Top',use:'Work, Casual',season:'Year-round',rating:4,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/836938_1362?$pdpMainImage$',emoji:'\u{1F455}'},
{wid:'w_04',name:'Petite Trouser Seasonless Stretch',brand:'Ann Taylor',color:'Deep Navy Sky',size:'8 Petite',type:'Bottom',use:'Work',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/831533_1934?$pdpMainImage$',emoji:'\u{1F456}'},
{wid:'w_05',name:'Petite Trouser Seasonless Stretch',brand:'Ann Taylor',color:'Deep Navy Sky',size:'10 Petite',type:'Bottom',use:'Work',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/831533_1934?$pdpMainImage$',emoji:'\u{1F456}'},
{wid:'w_06',name:'Petite Notched One Button Blazer',brand:'Ann Taylor',color:'Deep Navy Sky',size:'6 Petite',type:'Outerwear',use:'Work, Formal',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/613313_1934?$pdpMainImage$',emoji:'\u{1F9E5}'},
{wid:'w_07',name:'Petite Collarless Blazer',brand:'Ann Taylor',color:'Deep Navy Sky',size:'6 Petite',type:'Outerwear',use:'Work, Formal',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/842985_1934?$pdpMainImage$',emoji:'\u{1F9E5}'},
{wid:'w_08',name:'Petite Side Zip Trouser Fluid Crepe',brand:'Ann Taylor',color:'Ivory Whisper',size:'8 Petite',type:'Bottom',use:'Work, Formal',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/612729_9007?$pdpMainImage$',emoji:'\u{1F456}'},
{wid:'w_09',name:'Petite Long Collarless Blazer',brand:'Ann Taylor',color:'Ivory Whisper',size:'6 Petite',type:'Outerwear',use:'Work, Formal',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/611127_9007?$pdpMainImage$',emoji:'\u{1F9E5}'},
{wid:'w_10',name:'Petite Long Collarless Blazer',brand:'Ann Taylor',color:'Black',size:'6 Petite',type:'Outerwear',use:'Work, Formal',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/611127_2222_MKTG1?$pdpMainImage$',emoji:'\u{1F9E5}'},
{wid:'w_11',name:'Petite Side Zip Trouser Fluid Crepe',brand:'Ann Taylor',color:'Black',size:'8 Petite',type:'Bottom',use:'Work, Formal',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/611136_2222?$pdpMainImage$',emoji:'\u{1F456}'},
{wid:'w_12',name:'Petite Side Zip Ankle Pant',brand:'Ann Taylor',color:'Black',size:'8 Petite',type:'Bottom',use:'Work',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/612732_2222?$pdpMainImage$',emoji:'\u{1F456}'},
{wid:'w_13',name:'Classic White Tee',brand:'Mott & Bow',color:'White',size:'',type:'Top',use:'Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'',emoji:'\u{1F455}'},
{wid:'w_14',name:'Supersmooth Wide Leg Pant',brand:'Spanx',color:'Sandbar',size:'Petite M',type:'Bottom',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'',emoji:'\u{1F456}'},
{wid:'w_15',name:'Juliet Mia Loafer',brand:'Clarks',color:'Tan',size:'8',type:'Shoes',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://m.media-amazon.com/images/I/71xvd2bBbOL._AC_SR700,525_.jpg',emoji:'\u{1F45E}'},
{wid:'w_16',name:'Vienna Loafer',brand:'ECCO',color:'Black',size:'8-8.5',type:'Shoes',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://m.media-amazon.com/images/I/61uDLPMGKnL._AC_SR700,525_.jpg',emoji:'\u{1F45E}'},
{wid:'w_17',name:'Larisa Clog',brand:'Dansko',color:'Black',size:'EU 38',type:'Shoes',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://m.media-amazon.com/images/I/71J2GQpTEJL._AC_SR700,525_.jpg',emoji:'\u{1F45E}'},
{wid:'w_18',name:'Reagan Flat',brand:'Trotters',color:'Black',size:'8W',type:'Shoes',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://m.media-amazon.com/images/I/61o5v3FjURL._AC_SR700,525_.jpg',emoji:'\u{1F45E}'},
{wid:'w_19',name:'Aldaya Loafer',brand:'Pikolinos',color:'Black',size:'7.5-8',type:'Shoes',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://m.media-amazon.com/images/I/71Bde6QALSL._AC_SR700,525_.jpg',emoji:'\u{1F45E}'},
{wid:'w_20',name:'Anchor Line Crew Socks 3-Pack',brand:'Smartwool',color:'Black',size:'Medium',type:'Accessory',use:'Casual, Work',season:'Cool, Cold',rating:0,ironNeeded:false,photoUrl:'https://m.media-amazon.com/images/I/81bTpNaAi7L._AC_SR700,525_.jpg',emoji:'\u{1F9E6}'},
{wid:'w_21',name:'Uptown Shoes',brand:'Taos',color:'TBD',size:'',type:'Shoes',use:'Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'',emoji:'\u{1F45F}'},
{wid:'w_22',name:'Shoes',brand:'Orthofeet',color:'TBD',size:'',type:'Shoes',use:'Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'',emoji:'\u{1F45F}'},
{wid:'w_23',name:'Modern Seamless Scoop Neck Tee',brand:'Ann Taylor',color:'Black',size:'XS/S Classic',type:'Top',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/606864_2222',emoji:'\u{1F455}'},
{wid:'w_24',name:'Petite Horsebit Flare Jeans',brand:'Ann Taylor',color:'Rich Indigo',size:'8 Petite',type:'Bottom',use:'Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/836136_0425',emoji:'\u{1F456}'},
{wid:'w_25',name:'Chain Haircalf Loafer',brand:'Ann Taylor',color:'Brown Multi',size:'8 Classic',type:'Shoes',use:'Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/836045_6822_ALT1',emoji:'\u{1F45E}'},
{wid:'w_26',name:'Essential Mock Neck Sweater',brand:'Ann Taylor',color:'Black',size:'S Classic',type:'Top',use:'Work, Casual',season:'Cool, Cold',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/836459_2222',emoji:'\u{1F455}'},
{wid:'w_27',name:'Utilitarian Sweater Jacket',brand:'Ann Taylor',color:'Black',size:'S Classic',type:'Outerwear',use:'Casual',season:'Cool, Cold',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/840208_2222',emoji:'\u{1F9E5}'},
{wid:'w_28',name:'Scoop Neck Elbow Sleeve Tee',brand:'Ann Taylor',color:'Rainforest',size:'S Classic',type:'Top',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/836938_6523?$pdpMainImage$',emoji:'\u{1F455}'},
{wid:'w_29',name:'Scoop Neck Elbow Sleeve Tee',brand:'Ann Taylor',color:'Indigo Dusk',size:'S Classic',type:'Top',use:'Work, Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'',emoji:'\u{1F455}'},
{wid:'w_30',name:'Petite Essential Shirt',brand:'Ann Taylor',color:'Winter White',size:'S Petite',type:'Top',use:'Work',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/484090_9192?$pdpMainImage$',emoji:'\u{1F454}'},
{wid:'w_31',name:'Petite Perfect Shirt',brand:'Ann Taylor',color:'White',size:'6 Petite',type:'Top',use:'Work',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://anninc.scene7.com/is/image/AN/397973_9000?$pdpMainImage$',emoji:'\u{1F454}'},
{wid:'w_32',name:'Slim Organic Cotton Chambray Shirt',brand:'J.Crew',color:'Five Year Wash',size:'S',type:'Top',use:'Casual',season:'Year-round',rating:0,ironNeeded:false,photoUrl:'https://www.jcrew.com/s7-img-facade/BE077_WZ1606?$pdpMain$',emoji:'\u{1F455}'},
];


// === SECTION 3: App startup ===
document.addEventListener('DOMContentLoaded', function() {
  wireUpAuth(); wireUpNav(); wireUpVibePicker(); wireUpCloset();
  wireUpAddItem(); wireUpDetailPanel(); wireUpPicker(); wireUpArchive(); wireUpPlan();
  var t = sessionStorage.getItem('wardrobe_token');
  if (t) { state.accessToken = t; enterApp(false); }
});

// === SECTION 4: Auth ===
function wireUpAuth() {
  document.getElementById('btnGoogleSignIn').addEventListener('click', startGoogleSignIn);
  document.getElementById('btnDemo').addEventListener('click', function() { enterApp(true); });
}
function startGoogleSignIn() {
  if (typeof google==='undefined'||!google.accounts) { alert('Google sign-in is still loading.'); return; }
  var client = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID, scope: CONFIG.SCOPES,
    callback: function(r) { if(r.access_token){state.accessToken=r.access_token;sessionStorage.setItem('wardrobe_token',r.access_token);enterApp(false);} }
  });
  client.requestAccessToken();
}
function enterApp(isDemo) {
  state.isDemo = isDemo;
  document.getElementById('authScreen').classList.remove('active');
  document.getElementById('todayScreen').classList.add('active');
  document.getElementById('bottomNav').classList.add('visible');
  if (isDemo) {
    document.getElementById('demoBanner').classList.add('visible');
    state.wardrobe = DEMO_ITEMS.map(function(i){return Object.assign({},i);});
  } else { loadWardrobeFromSheet(); loadArchiveFromSheet(); loadCalendarEvents(); }
  loadWeather(); renderTodayScreen();
}

// === SECTION 5: Navigation ===
function wireUpNav() {
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchScreen(btn.dataset.screen);
      document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
    });
  });
}
function switchScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById(id).classList.add('active');
  if(id==='todayScreen') renderTodayScreen();
  if(id==='planScreen') renderPlanScreen();
  if(id==='closetScreen') renderClosetGrid();
}

// === SECTION 6: Weather (Open-Meteo, free, no key) ===
function loadWeather() {
  fetch('https://api.open-meteo.com/v1/forecast?latitude=37.77&longitude=-122.42&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=fahrenheit&timezone=America/Los_Angeles&forecast_days=7')
  .then(function(r){return r.json();}).then(function(data) {
    var c=data.current;
    state.weather = {
      temp:Math.round(c.temperature_2m), code:c.weather_code,
      icon:weatherIcon(c.weather_code), condition:weatherCondition(c.weather_code),
      forecast:data.daily.time.map(function(date,i){
        return {date:date,high:Math.round(data.daily.temperature_2m_max[i]),low:Math.round(data.daily.temperature_2m_min[i]),
          code:data.daily.weather_code[i],icon:weatherIcon(data.daily.weather_code[i]),
          condition:weatherCondition(data.daily.weather_code[i]),rainChance:data.daily.precipitation_probability_max[i]};
      })
    };
    document.getElementById('weatherIcon').textContent=state.weather.icon;
    document.getElementById('weatherTemp').textContent=state.weather.temp+'\u00B0F';
    document.getElementById('weatherDesc').textContent=state.weather.condition;
    renderCommuteNote();
  }).catch(function(e){console.warn('Weather:',e);document.getElementById('weatherDesc').textContent='Weather unavailable';});
}
function weatherIcon(c){if(c===0)return'\u2600\uFE0F';if(c<=3)return'\u26C5';if(c<=48)return'\uD83C\uDF2B\uFE0F';if(c<=67)return'\uD83C\uDF27\uFE0F';if(c<=77)return'\uD83C\uDF28\uFE0F';if(c<=82)return'\uD83C\uDF27\uFE0F';if(c>=95)return'\u26C8\uFE0F';return'\u2601\uFE0F';}
function weatherCondition(c){if(c===0)return'Clear sky';if(c<=3)return'Partly cloudy';if(c<=48)return'Foggy';if(c<=55)return'Drizzle';if(c<=67)return'Rain';if(c<=77)return'Snow';if(c<=82)return'Rain showers';if(c>=95)return'Thunderstorm';return'Cloudy';}
function isRainy(c){return c>=51;}
function getTempForDate(d){if(!state.weather)return 60;if(!d)return state.weather.temp;var f=state.weather.forecast.find(function(x){return x.date===d;});return f?f.high:state.weather.temp;}

// === SECTION 7: Calendar ===
function loadCalendarEvents() {
  if(state.isDemo||!state.accessToken) return;
  var now=new Date(),mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));mon.setHours(0,0,0,0);
  var sun=new Date(mon);sun.setDate(mon.getDate()+6);sun.setHours(23,59,59,999);
  var timeParams='?timeMin='+mon.toISOString()+'&timeMax='+sun.toISOString()+'&singleEvents=true&orderBy=startTime&maxResults=50';
  // Pull from both Bina's primary calendar and the Bina & Sandeep shared calendar
  var calIds=['primary','8hebqgfaeab317ef1rqa6oiu30@group.calendar.google.com'];
  state.calendarEvents={};
  calIds.forEach(function(calId){
    fetch('https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(calId)+'/events'+timeParams,
      {headers:{Authorization:'Bearer '+state.accessToken}})
    .then(function(r){return r.json();}).then(function(data){
      (data.items||[]).forEach(function(ev){var s=ev.start.dateTime||ev.start.date,d=s.slice(0,10);
        if(!state.calendarEvents[d])state.calendarEvents[d]=[];
        var title=ev.summary||'Event';
        // Avoid duplicate event names on the same day
        if(state.calendarEvents[d].indexOf(title)<0) state.calendarEvents[d].push(title);
      });
    }).catch(function(e){console.warn('Cal ('+calId+'):',e);});
  });
}

// === SECTION 8: Google Sheets ===
function loadWardrobeFromSheet() {
  if(state.isDemo||!state.accessToken) return;
  var range=CONFIG.SHEET_NAME+'!A2:L';
  fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(range),
    {headers:{Authorization:'Bearer '+state.accessToken}})
  .then(function(r){return r.json();}).then(function(data){
    state.wardrobe=(data.values||[]).map(function(row){
      return {wid:row[0]||'',name:row[1]||'',brand:row[2]||'',color:row[3]||'',size:row[4]||'',
        type:row[5]||'Top',use:row[6]||'',season:row[7]||'Year-round',rating:parseRating(row[8]),
        ironNeeded:false,photoUrl:row[11]||'',emoji:getEmojiForType(row[5]||'Top')};
    }).filter(function(i){return i.wid;});
    renderClosetGrid(); renderTodayScreen(); refreshPhotoUrls();
  }).catch(function(e){console.error('Sheet:',e);});
}
function findSheetRow(wid){
  return fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(CONFIG.SHEET_NAME+'!A:A'),
    {headers:{Authorization:'Bearer '+state.accessToken}})
  .then(function(r){return r.json();}).then(function(data){
    var rows=data.values||[];for(var i=0;i<rows.length;i++){if(rows[i][0]===wid)return i+1;}return null;});
}
function updateSheetCell(row,col,val){
  return fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(CONFIG.SHEET_NAME+'!'+col+row)+'?valueInputOption=RAW',
    {method:'PUT',headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[[val]]})});
}
function appendSheetRow(vals){
  return fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(CONFIG.SHEET_NAME+'!A:L')+':append?valueInputOption=RAW',
    {method:'POST',headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},body:JSON.stringify({values:[vals]})});
}
function deleteSheetRow(rn){
  return fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+':batchUpdate',
    {method:'POST',headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},
     body:JSON.stringify({requests:[{deleteDimension:{range:{sheetId:0,dimension:'ROWS',startIndex:rn-1,endIndex:rn}}}]})});
}
function saveRatingToSheet(wid,rating){
  if(state.isDemo||!state.accessToken)return;
  findSheetRow(wid).then(function(row){if(row){var s=rating+' '+'\u2605'.repeat(rating)+'\u2606'.repeat(5-rating);updateSheetCell(row,'I',s);}});
}
function updateItemInSheet(item){
  if(state.isDemo||!state.accessToken) return Promise.resolve();
  return findSheetRow(item.wid).then(function(row){
    if(!row)return;
    var rs=item.rating?item.rating+' '+'\u2605'.repeat(item.rating)+'\u2606'.repeat(5-item.rating):'';
    fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(CONFIG.SHEET_NAME+'!A'+row+':I'+row)+'?valueInputOption=RAW',
      {method:'PUT',headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},
       body:JSON.stringify({values:[[item.wid,item.name,item.brand,item.color,item.size,item.type,item.use,item.season,rs]]})});
    fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(CONFIG.SHEET_NAME+'!L'+row)+'?valueInputOption=RAW',
      {method:'PUT',headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},
       body:JSON.stringify({values:[[item._sheetPhotoVal||item.photoUrl]]})});
  });
}
function loadArchiveFromSheet(){
  if(state.isDemo||!state.accessToken)return;
  fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(CONFIG.ARCHIVE_SHEET_NAME+'!A2:G'),
    {headers:{Authorization:'Bearer '+state.accessToken}})
  .then(function(r){return r.json();}).then(function(data){
    state.archive=(data.values||[]).map(function(row){
      return {date:row[0]||'',topWid:row[1]||'',bottomWid:row[2]||'',shoesWid:row[3]||'',formality:parseInt(row[4])||3,weather:row[5]||'',notes:row[6]||''};});
  }).catch(function(e){console.warn('Archive:',e);});
}
// Ensure the Outfit Archive tab exists in the sheet (creates it if missing)
var archiveTabReady = false;
function ensureArchiveTab() {
  if (archiveTabReady || state.isDemo || !state.accessToken) return Promise.resolve();
  return fetch('https://sheets.googleapis.com/v4/spreadsheets/' + CONFIG.SPREADSHEET_ID,
    {headers:{Authorization:'Bearer '+state.accessToken}})
  .then(function(r){return r.json();})
  .then(function(d) {
    var tabs = d.sheets ? d.sheets.map(function(s){return s.properties.title;}) : [];
    if (tabs.indexOf(CONFIG.ARCHIVE_SHEET_NAME) >= 0) { archiveTabReady = true; return; }
    // Create the tab and add headers
    return fetch('https://sheets.googleapis.com/v4/spreadsheets/' + CONFIG.SPREADSHEET_ID + ':batchUpdate', {
      method: 'POST',
      headers: {Authorization:'Bearer '+state.accessToken, 'Content-Type':'application/json'},
      body: JSON.stringify({requests:[{addSheet:{properties:{title:CONFIG.ARCHIVE_SHEET_NAME}}}]})
    }).then(function(){
      // Add header row
      return fetch('https://sheets.googleapis.com/v4/spreadsheets/' + CONFIG.SPREADSHEET_ID + '/values/' + encodeURIComponent(CONFIG.ARCHIVE_SHEET_NAME + '!A1:G1') + '?valueInputOption=RAW', {
        method: 'PUT',
        headers: {Authorization:'Bearer '+state.accessToken, 'Content-Type':'application/json'},
        body: JSON.stringify({values:[['Date','Top','Bottom','Shoes','Formality','Weather','Notes']]})
      });
    }).then(function(){ archiveTabReady = true; });
  });
}

function saveOutfitToArchive(outfit,dateStr,formality){
  var entry={date:dateStr,topWid:outfit.top?outfit.top.wid:'',bottomWid:outfit.bottom?outfit.bottom.wid:'',
    shoesWid:outfit.shoes?outfit.shoes.wid:'',formality:formality,
    weather:state.weather?state.weather.temp+'\u00B0F '+state.weather.condition:'',notes:''};
  state.archive.push(entry);
  if(!state.isDemo&&state.accessToken){
    ensureArchiveTab().then(function(){
      fetch('https://sheets.googleapis.com/v4/spreadsheets/'+CONFIG.SPREADSHEET_ID+'/values/'+encodeURIComponent(CONFIG.ARCHIVE_SHEET_NAME+'!A:G')+':append?valueInputOption=RAW',
        {method:'POST',headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},
         body:JSON.stringify({values:[[entry.date,entry.topWid,entry.bottomWid,entry.shoesWid,entry.formality,entry.weather,entry.notes]]})});
    });
  }
}

// === SECTION 9: Google Photos upload ===
// Get or create an app-owned album (Google Photos API can only write
// to albums the app itself created — not albums made in the Photos UI)
var appAlbumId = null;
function getOrCreateAlbum() {
  if (appAlbumId) return Promise.resolve(appAlbumId);
  // Check if we already have one
  return fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=50',
    {headers:{Authorization:'Bearer '+state.accessToken}})
  .then(function(r){return r.json();})
  .then(function(data) {
    var albums = data.albums || [];
    for (var i = 0; i < albums.length; i++) {
      if (albums[i].title === 'Wardrobe') { appAlbumId = albums[i].id; return appAlbumId; }
    }
    // Not found — create it
    return fetch('https://photoslibrary.googleapis.com/v1/albums', {
      method: 'POST',
      headers: {Authorization:'Bearer '+state.accessToken, 'Content-Type':'application/json'},
      body: JSON.stringify({album:{title:'Wardrobe'}})
    }).then(function(r){return r.json();}).then(function(a){
      appAlbumId = a.id;
      return appAlbumId;
    });
  });
}

function uploadToGooglePhotos(b64){
  if(state.isDemo||!state.accessToken) return Promise.resolve(null);
  var bin=atob(b64),bytes=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);

  return getOrCreateAlbum().then(function(albumId) {
    return fetch('https://photoslibrary.googleapis.com/v1/uploads',{method:'POST',
      headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/octet-stream','X-Goog-Upload-Content-Type':'image/jpeg','X-Goog-Upload-Protocol':'raw'},body:bytes})
    .then(function(r){
      if(!r.ok) return r.text().then(function(t){alert('Photo upload failed: '+r.status+' '+t);return null;});
      return r.text();
    }).then(function(tok){
      if(!tok) return null;
      return fetch('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate',{method:'POST',
        headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},
        body:JSON.stringify({albumId:albumId,newMediaItems:[{simpleMediaItem:{uploadToken:tok,fileName:'wardrobe_'+Date.now()+'.jpg'}}]})})
      .then(function(r){return r.json();});
    }).then(function(d){
      if(!d) return null;
      if(d.error){alert('Photo save failed: '+d.error.message);return null;}
      var r=d.newMediaItemResults&&d.newMediaItemResults[0];
      if(!r||!r.mediaItem) return null;
      // Save the media item ID prefixed with gphoto: so we can refresh the URL later
      // Also grab the fresh baseUrl for immediate display
      var mediaId = r.mediaItem.id;
      return fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search',{method:'POST',
        headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},
        body:JSON.stringify({albumId:albumId,pageSize:5})})
      .then(function(r){return r.json();})
      .then(function(search){
        var freshUrl = null;
        if(search.mediaItems){
          for(var i=0;i<search.mediaItems.length;i++){
            if(search.mediaItems[i].id===mediaId){freshUrl=search.mediaItems[i].baseUrl;break;}
          }
        }
        // Return both: the permanent ID for the sheet, and the fresh URL for display
        return {sheetValue:'gphoto:'+mediaId, displayUrl:freshUrl};
      });
    });
  }).catch(function(e){alert('Photo error: '+e.message);console.error('Photo:',e);return null;});
}

// Refresh Google Photos URLs for all items that have gphoto: IDs.
// Called after loading wardrobe from sheet. baseUrls expire after ~1 hour,
// so we need fresh ones each session.
function refreshPhotoUrls() {
  if(state.isDemo||!state.accessToken) return;
  var gphotos = state.wardrobe.filter(function(i){return i.photoUrl && i.photoUrl.indexOf('gphoto:')===0;});
  if(!gphotos.length) return;
  getOrCreateAlbum().then(function(albumId){
    // Fetch all photos from the album
    return fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search',{method:'POST',
      headers:{Authorization:'Bearer '+state.accessToken,'Content-Type':'application/json'},
      body:JSON.stringify({albumId:albumId,pageSize:100})})
    .then(function(r){return r.json();});
  }).then(function(data){
    if(!data.mediaItems) return;
    // Build a map of mediaId -> baseUrl
    var urlMap={};
    data.mediaItems.forEach(function(m){urlMap[m.id]=m.baseUrl;});
    // Update wardrobe items
    var updated=false;
    gphotos.forEach(function(item){
      var mediaId=item.photoUrl.replace('gphoto:','');
      if(urlMap[mediaId]){item.photoUrl=urlMap[mediaId];updated=true;}
    });
    if(updated) renderClosetGrid();
  }).catch(function(e){console.warn('Photo refresh:',e);});
}

// === SECTION 10: Today screen ===
function renderTodayScreen() {
  var now=new Date();
  document.getElementById('todayDate').textContent=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  state.todayOutfit=generateOutfit(state.currentVibe);
  renderOutfitCard(state.todayOutfit,'todayOutfitItems');
  renderCommuteNote();
}
function wireUpVibePicker() {
  document.getElementById('vibePicker').addEventListener('click',function(e){
    var chip=e.target.closest('.vibe-chip');if(!chip)return;
    document.querySelectorAll('.vibe-chip').forEach(function(c){c.classList.remove('selected');});
    chip.classList.add('selected'); state.currentVibe=chip.dataset.vibe;
    state.todayOutfit=generateOutfit(state.currentVibe);
    renderOutfitCard(state.todayOutfit,'todayOutfitItems'); renderCommuteNote();
  });
  document.getElementById('btnTryAnother').addEventListener('click',function(){
    state.todayOutfit=generateOutfit(state.currentVibe);
    renderOutfitCard(state.todayOutfit,'todayOutfitItems'); renderCommuteNote();
  });
  document.getElementById('btnLooksGood').addEventListener('click',function(){
    if(!state.todayOutfit)return;
    saveOutfitToArchive(state.todayOutfit,toDateStr(new Date()),vibeToFormality(state.currentVibe));
    var btn=document.getElementById('btnLooksGood');btn.textContent='Approved \u2713';
    setTimeout(function(){btn.textContent='Looks good \u2713';},2000);
  });
}
function renderOutfitCard(outfit,cid) {
  var c=document.getElementById(cid);
  if(!outfit){c.innerHTML='<p style="color:#999;padding:1rem;">Add more items to get outfit suggestions.</p>';return;}
  var slots=['top','bottom','shoes','outerwear'];
  c.innerHTML=slots.filter(function(s){return outfit[s];}).map(function(s){
    var item=outfit[s];
    var ph=item.photoUrl?'<img src="'+esc(item.photoUrl)+'" alt="'+esc(item.name)+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span class="emoji-fallback" style="display:none">'+item.emoji+'</span>'
      :'<span class="emoji-fallback">'+item.emoji+'</span>';
    return '<div class="outfit-item" data-wid="'+item.wid+'" data-slot="'+s+'"><div class="outfit-item-photo">'+ph+'<button class="swap-btn" title="Swap">\u21BB</button></div><div class="outfit-item-type">'+s+'</div><div class="outfit-item-label">'+esc(item.name)+'</div></div>';
  }).join('');
  c.querySelectorAll('.swap-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){e.stopPropagation();
      var el=btn.closest('.outfit-item'),sl=el.dataset.slot;
      var tm={top:'Top',bottom:'Bottom',shoes:'Shoes',outerwear:'Outerwear'};
      openPicker(tm[sl],el.dataset.wid,function(ni){outfit[sl]=ni;renderOutfitCard(outfit,cid);renderCommuteNote();});
    });
  });
}

// === SECTION 11: Outfit logic ===
function generateOutfit(vibe,dateStr) {
  var temp=getTempForDate(dateStr),wc=state.weather?state.weather.code:0;
  var needsOW=temp<65||isRainy(wc),tags=vibeToUseTags(vibe);
  var top=pickItem('Top',tags,temp),bot=pickItem('Bottom',tags,temp),shoes=pickItem('Shoes',tags,temp);
  var ow=needsOW?pickItem('Outerwear',tags,temp):null;
  if(!top&&!bot&&!shoes) return null;
  return {top:top,bottom:bot,shoes:shoes,outerwear:ow};
}
function vibeToUseTags(v){return{work:['Work'],casual:['Casual'],funky:['Funky','Casual'],formal:['Formal','Work']}[v]||['Work'];}
function vibeToFormality(v){return{work:3,casual:2,funky:2,formal:4}[v]||3;}
function pickItem(type,useTags,temp) {
  var cands=state.wardrobe.filter(function(i){return i.type===type;});
  if(!cands.length) return null;
  // Filter by use tags
  var tagged=cands.filter(function(i){var t=i.use.split(',').map(function(x){return x.trim();});return useTags.some(function(u){return t.indexOf(u)>=0;});});
  if(tagged.length) cands=tagged;
  // Cold weather: prefer seasonal
  if(temp<60){var sea=cands.filter(function(i){return i.season==='Cool'||i.season==='Cold'||i.season==='Year-round';});if(sea.length)cands=sea;}
  // Skip recently worn
  var recent=getRecentlyWornWids();var fresh=cands.filter(function(i){return!recent.has(i.wid);});if(fresh.length)cands=fresh;
  // Sort by rating desc, randomize ties
  cands.sort(function(a,b){if(b.rating!==a.rating)return b.rating-a.rating;return Math.random()-0.5;});
  var good=cands.filter(function(i){return i.rating>=3;});
  if(good.length) return good[Math.floor(Math.random()*good.length)];
  return cands[Math.floor(Math.random()*cands.length)];
}
function getRecentlyWornWids() {
  var cut=new Date();cut.setDate(cut.getDate()-7);var wids=new Set();
  state.archive.forEach(function(e){if(new Date(e.date)>=cut){[e.topWid,e.bottomWid,e.shoesWid].forEach(function(w){if(w)wids.add(w);});}});
  return wids;
}

// === SECTION 12: Commute note ===
function renderCommuteNote(temp,wc,formality,cid) {
  var t=temp||(state.weather?state.weather.temp:60);
  var w=wc||(state.weather?state.weather.code:0);
  var f=formality||vibeToFormality(state.currentVibe);
  var id=cid||'todayCommute',notes=[];
  notes.push(t>=69?'\uD83E\uDDE6 Lightweight Smartwool socks today':'\uD83E\uDDE6 Regular mid-weight Smartwool socks today');
  if(isRainy(w)) notes.push('\uD83C\uDF27\uFE0F Grab your rain jacket and umbrella');
  if(f>=4) notes.push('\uD83D\uDC5E Bring polished shoes to change into at the office');
  notes.push('\uD83E\uDDB6 Orthotics in \u2014 comfortable closed-toe shoes for BART');
  var el=document.getElementById(id);
  if(el) el.innerHTML=notes.map(function(n){return '<div>'+n+'</div>';}).join('');
}

// === SECTION 13: Plan screen ===
function wireUpPlan(){document.getElementById('btnApproveAll').addEventListener('click',approveAllOutfits);}
function renderPlanScreen() {
  var cont=document.getElementById('planDays'),days=getWeekDays();cont.innerHTML='';
  days.forEach(function(day){
    if(!state.planOutfits[day.dateStr]) state.planOutfits[day.dateStr]={outfit:generateOutfit('work',day.dateStr),formality:3,approved:false};
    var plan=state.planOutfits[day.dateStr];
    var fc=state.weather&&state.weather.forecast?state.weather.forecast.find(function(f){return f.date===day.dateStr;}):null;
    var events=state.calendarEvents[day.dateStr]||[];
    var rain=fc?fc.rainChance>30:false;
    var card=document.createElement('div');
    card.className='day-card'+(plan.approved?' approved':'');card.dataset.date=day.dateStr;
    var tags=events.map(function(ev){return '<span class="tag tag-event">'+esc(ev)+'</span>';}).join('');
    if(rain) tags+='<span class="tag tag-rain">\uD83C\uDF27 Rain likely</span>';
    if(plan.approved) tags+='<span class="tag tag-approved">\u2713 Approved</span>';
    var dots='';for(var d=0;d<5;d++)dots+='<div class="formality-dot'+(d<plan.formality?' filled':'')+'"></div>';
    var strip=['top','bottom','shoes','outerwear'].filter(function(s){return plan.outfit&&plan.outfit[s];}).map(function(s){
      var it=plan.outfit[s];return it.photoUrl?'<div class="mini-thumb"><img src="'+esc(it.photoUrl)+'" alt="'+esc(it.name)+'" onerror="this.outerHTML=\''+it.emoji+'\'"></div>':'<div class="mini-thumb">'+it.emoji+'</div>';
    }).join('');
    var fbtns='';for(var fi=1;fi<=5;fi++)fbtns+='<button class="formality-btn'+(fi===plan.formality?' selected':'')+'" data-f="'+fi+'">'+fi+'</button>';
    card.innerHTML='<div class="day-card-header"><span class="day-name">'+day.dayName+'</span><span class="day-date">'+day.monthDay+'</span></div>'+
      '<div class="day-card-weather">'+(fc?fc.icon+' '+fc.high+'\u00B0/'+fc.low+'\u00B0 '+fc.condition:'')+'</div>'+
      (tags?'<div class="day-card-tags">'+tags+'</div>':'')+
      '<div style="display:flex;align-items:center;gap:0.5rem;"><div class="formality-dots">'+dots+'</div><span style="font-size:0.7rem;color:#999;">Formality</span></div>'+
      '<div class="day-card-outfit-strip">'+strip+'</div>'+
      '<div class="day-expanded">'+
        '<div class="form-group"><label class="form-label">Formality</label><div class="formality-picker" data-date="'+day.dateStr+'">'+fbtns+'</div></div>'+
        (fc?'<div style="font-size:0.85rem;margin-bottom:0.5rem;">'+fc.icon+' '+fc.high+'\u00B0F / '+fc.low+'\u00B0F \u2014 '+fc.condition+(fc.rainChance>0?' ('+fc.rainChance+'% rain)':'')+'</div>':'')+
        (events.length?'<div style="margin-bottom:0.5rem;">'+events.map(function(e){return '<span class="tag tag-event">'+esc(e)+'</span>';}).join(' ')+'</div>':'')+
        '<div class="day-outfit-full" id="dayOutfit_'+day.dateStr+'"></div>'+
        (plan.outfit&&hasIronNeeded(plan.outfit)?'<div class="iron-flag">\uD83D\uDD25 Iron needed</div>':'')+
        '<div class="commute-note day-commute-note" id="dayCommute_'+day.dateStr+'"></div>'+
        '<button class="day-approve-btn" data-date="'+day.dateStr+'">'+(plan.approved?'Approved \u2713 \u00A0tap to edit':'Approve outfit')+'</button></div>';
    card.addEventListener('click',function(e){
      if(e.target.closest('.formality-btn,.day-approve-btn,.swap-btn,.formality-picker'))return;
      card.classList.toggle('expanded');
      if(card.classList.contains('expanded')){renderOutfitCard(plan.outfit,'dayOutfit_'+day.dateStr);renderCommuteNote(fc?fc.high:null,fc?fc.code:null,plan.formality,'dayCommute_'+day.dateStr);}
    });
    cont.appendChild(card);
  });
  cont.querySelectorAll('.formality-picker').forEach(function(pk){
    pk.addEventListener('click',function(e){var btn=e.target.closest('.formality-btn');if(!btn)return;e.stopPropagation();
      var ds=pk.dataset.date,f=parseInt(btn.dataset.f);state.planOutfits[ds].formality=f;
      var v={1:'casual',2:'casual',3:'work',4:'formal',5:'formal'};state.planOutfits[ds].outfit=generateOutfit(v[f]||'work',ds);renderPlanScreen();});
  });
  cont.querySelectorAll('.day-approve-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){e.stopPropagation();var ds=btn.dataset.date,p=state.planOutfits[ds];
      if(p.approved){
        // Unapprove — let them edit
        p.approved=false;
        // Remove from in-memory archive (the sheet entry stays as a record)
        state.archive=state.archive.filter(function(a){return a.date!==ds;});
        renderPlanScreen();
      } else if(p.outfit){
        p.approved=true;saveOutfitToArchive(p.outfit,ds,p.formality);renderPlanScreen();
      }
    });
  });
}
function approveAllOutfits(){getWeekDays().forEach(function(d){var p=state.planOutfits[d.dateStr];if(p&&!p.approved&&p.outfit){p.approved=true;saveOutfitToArchive(p.outfit,d.dateStr,p.formality);}});renderPlanScreen();}
function hasIronNeeded(o){return['top','bottom','shoes','outerwear'].some(function(s){return o[s]&&o[s].ironNeeded;});}
function getWeekDays(){var now=new Date(),mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));var days=[];
  for(var i=0;i<5;i++){var d=new Date(mon);d.setDate(mon.getDate()+i);days.push({date:d,dateStr:toDateStr(d),dayName:d.toLocaleDateString('en-US',{weekday:'long'}),monthDay:d.toLocaleDateString('en-US',{month:'short',day:'numeric'})});}return days;}

// === SECTION 14: Closet screen ===
function wireUpCloset(){
  document.getElementById('closetFilters').addEventListener('click',function(e){var p=e.target.closest('.filter-pill');if(!p)return;
    document.querySelectorAll('.filter-pill').forEach(function(x){x.classList.remove('selected');});p.classList.add('selected');state.closetFilter=p.dataset.filter;renderClosetGrid();});
  document.getElementById('closetSort').addEventListener('change',function(e){state.closetSort=e.target.value;renderClosetGrid();});
}
function renderClosetGrid(){
  var items=state.wardrobe.slice();
  if(state.closetFilter!=='all') items=items.filter(function(i){return i.type===state.closetFilter;});
  switch(state.closetSort){case 'topRated':items.sort(function(a,b){return b.rating-a.rating;});break;case 'lowRated':items.sort(function(a,b){return a.rating-b.rating;});break;case 'brandAZ':items.sort(function(a,b){return(a.brand||'').localeCompare(b.brand||'');});break;default:items.reverse();break;}
  document.getElementById('closetCount').textContent=state.wardrobe.length+' items';
  var grid=document.getElementById('closetGrid');
  grid.innerHTML=items.map(function(item){
    var low=item.rating>0&&item.rating<=2,unrated=item.rating===0;
    var ph=item.photoUrl?'<img src="'+esc(item.photoUrl)+'" alt="'+esc(item.name)+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span class="emoji-fallback" style="display:none">'+item.emoji+'</span>'
      :'<span class="emoji-fallback">'+item.emoji+'</span>';
    return '<div class="item-card'+(low?' low-rated':'')+'" data-wid="'+item.wid+'">'+
      (unrated?'<span class="badge-rate-me">Rate me</span>':'')+(low?'<span class="badge-donate">Donate?</span>':'')+
      '<div class="item-card-photo">'+ph+'</div><div class="item-card-body">'+
      '<div class="item-card-name">'+esc(item.name)+'</div><div class="item-card-brand">'+esc(item.brand)+'</div>'+
      '<div class="item-card-color">'+esc(item.color)+'</div>'+
      '<div class="item-card-stars" data-wid="'+item.wid+'">'+renderStarsHtml(item.rating)+'</div></div></div>';
  }).join('')+'<div class="item-card item-card-add" id="addItemCard"><span class="plus">+</span><span class="label">Add Item</span></div>';
  grid.querySelectorAll('.item-card:not(.item-card-add)').forEach(function(card){card.addEventListener('click',function(e){if(e.target.closest('.item-card-stars'))return;openDetailPanel(card.dataset.wid);});});
  grid.querySelectorAll('.item-card-stars').forEach(function(se){se.addEventListener('click',function(e){var star=e.target.closest('.star');if(!star)return;
    var wid=se.dataset.wid,r=parseInt(star.dataset.star),item=state.wardrobe.find(function(i){return i.wid===wid;});
    if(item){item.rating=r;se.innerHTML=renderStarsHtml(r);saveRatingToSheet(wid,r);}});});
  document.getElementById('addItemCard').addEventListener('click',openAddItem);
}

// === SECTION 15: Add Item overlay ===
var addItemPhotoData=null;
function wireUpAddItem(){
  document.getElementById('addItemBackdrop').addEventListener('click',closeAddItem);
  document.getElementById('addCancel').addEventListener('click',closeAddItem);
  var cam=document.getElementById('addCamera'),inp=document.getElementById('addPhotoInput');
  cam.addEventListener('click',function(){inp.click();});
  inp.addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){addItemPhotoData=r.result.split(',')[1];cam.innerHTML='<img src="'+r.result+'" alt="Preview">';};r.readAsDataURL(f);});
  wireUpSingleChips('addTypeChips');wireUpMultiChips('addUseChips');wireUpSingleChips('addSeasonChips');
  document.getElementById('addIronToggle').addEventListener('click',function(){this.classList.toggle('on');});
  wireUpStarRating('addStarRating');
  document.getElementById('addSave').addEventListener('click',saveNewItem);
}
function openAddItem(){addItemPhotoData=null;
  document.getElementById('addCamera').innerHTML='<span class="camera-icon">\uD83D\uDCF7</span><span class="camera-text">Tap to take or choose a photo</span>';
  document.getElementById('addPhotoSaved').classList.remove('visible');
  ['addName','addBrand','addColor','addSize'].forEach(function(id){document.getElementById(id).value='';});
  resetChips('addTypeChips');resetChips('addUseChips');resetChips('addSeasonChips','Year-round');
  document.getElementById('addIronToggle').classList.remove('on');resetStarRating('addStarRating');
  document.getElementById('addPhotoInput').value='';document.getElementById('addItemOverlay').classList.add('visible');
}
function closeAddItem(){document.getElementById('addItemOverlay').classList.remove('visible');}
function saveNewItem(){
  var name=document.getElementById('addName').value.trim();if(!name){alert('Please enter a name.');return;}
  var type=getSelectedChip('addTypeChips')||'Top',use=getSelectedChips('addUseChips').join(', '),
      season=getSelectedChip('addSeasonChips')||'Year-round',rating=getStarRating('addStarRating'),
      iron=document.getElementById('addIronToggle').classList.contains('on'),wid='w_'+Date.now();
  var item={wid:wid,name:name,brand:document.getElementById('addBrand').value.trim(),
    color:document.getElementById('addColor').value.trim(),size:document.getElementById('addSize').value.trim(),
    type:type,use:use,season:season,rating:rating,ironNeeded:iron,photoUrl:'',emoji:getEmojiForType(type)};

  // Show saving state
  var saveBtn=document.getElementById('addSave');
  saveBtn.textContent='Saving...';saveBtn.disabled=true;

  // Upload photo to Google Photos if one was taken, then save to sheet
  var photoPromise = (addItemPhotoData && !state.isDemo && state.accessToken)
    ? uploadToGooglePhotos(addItemPhotoData)
    : Promise.resolve(null);

  photoPromise.then(function(result) {
    var sheetPhotoVal = '';
    if (result) {
      item.photoUrl = result.displayUrl || '';
      sheetPhotoVal = result.sheetValue || '';
      document.getElementById('addPhotoSaved').classList.add('visible');
    }
    state.wardrobe.push(item);
    if (!state.isDemo && state.accessToken) {
      var rs = rating ? rating + ' ' + '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating) : '';
      appendSheetRow([wid, name, item.brand, item.color, item.size, type, use, season, rs,
        new Date().toLocaleDateString('en-US', {month:'short', year:'numeric'}), '', sheetPhotoVal]);
    }
    saveBtn.textContent='Save to wardrobe';saveBtn.disabled=false;
    closeAddItem(); renderClosetGrid();
  });
}

// === SECTION 16: Item Detail overlay ===
var detailPhotoData=null;
function wireUpDetailPanel(){
  document.getElementById('detailBackdrop').addEventListener('click',closeDetailPanel);
  document.getElementById('detailCancel').addEventListener('click',closeDetailPanel);
  var dp=document.getElementById('detailPhoto'),di=document.getElementById('detailPhotoInput');
  dp.addEventListener('click',function(){di.click();});
  di.addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){detailPhotoData=r.result.split(',')[1];dp.innerHTML='<img src="'+r.result+'" alt="Photo"><span class="change-photo-badge">Change photo</span>';};r.readAsDataURL(f);});
  wireUpSingleChips('detailTypeChips');wireUpMultiChips('detailUseChips');wireUpSingleChips('detailSeasonChips');
  document.getElementById('detailIronToggle').addEventListener('click',function(){this.classList.toggle('on');});
  wireUpStarRating('detailStarRating');
  document.getElementById('detailSave').addEventListener('click',saveDetailChanges);
  document.getElementById('detailRemove').addEventListener('click',removeItem);
}
function openDetailPanel(wid){
  var item=state.wardrobe.find(function(i){return i.wid===wid;});if(!item)return;
  state.detailItemWid=wid;detailPhotoData=null;
  var dp=document.getElementById('detailPhoto');
  dp.innerHTML=item.photoUrl?'<img src="'+esc(item.photoUrl)+'" alt="'+esc(item.name)+'" onerror="this.style.display=\'none\'"><span class="change-photo-badge">Change photo</span>'
    :'<span class="camera-icon">'+item.emoji+'</span><span class="camera-text">No photo</span><span class="change-photo-badge">Change photo</span>';
  document.getElementById('detailName').value=item.name;document.getElementById('detailBrand').value=item.brand;
  document.getElementById('detailColor').value=item.color;document.getElementById('detailSize').value=item.size;
  selectChip('detailTypeChips',item.type);selectMultiChips('detailUseChips',item.use.split(',').map(function(s){return s.trim();}));
  selectChip('detailSeasonChips',item.season);document.getElementById('detailIronToggle').classList.toggle('on',item.ironNeeded);
  setStarRating('detailStarRating',item.rating);document.getElementById('detailOverlay').classList.add('visible');document.getElementById('detailPhotoInput').value='';
}
function closeDetailPanel(){document.getElementById('detailOverlay').classList.remove('visible');state.detailItemWid=null;}
function saveDetailChanges(){
  var item=state.wardrobe.find(function(i){return i.wid===state.detailItemWid;});if(!item)return;
  item.name=document.getElementById('detailName').value.trim();item.brand=document.getElementById('detailBrand').value.trim();
  item.color=document.getElementById('detailColor').value.trim();item.size=document.getElementById('detailSize').value.trim();
  item.type=getSelectedChip('detailTypeChips')||item.type;item.use=getSelectedChips('detailUseChips').join(', ');
  item.season=getSelectedChip('detailSeasonChips')||item.season;item.ironNeeded=document.getElementById('detailIronToggle').classList.contains('on');
  item.rating=getStarRating('detailStarRating');item.emoji=getEmojiForType(item.type);

  // Upload new photo if one was chosen, then save to sheet
  var photoPromise = (detailPhotoData && !state.isDemo && state.accessToken)
    ? uploadToGooglePhotos(detailPhotoData)
    : Promise.resolve(null);

  photoPromise.then(function(result) {
    if (result) {
      item.photoUrl = result.displayUrl || '';
      // Update sheet with the permanent gphoto: ID
      item._sheetPhotoVal = result.sheetValue || '';
    }
    updateItemInSheet(item);closeDetailPanel();renderClosetGrid();
  });
}
function removeItem(){if(!confirm('Remove this item from your wardrobe?'))return;var wid=state.detailItemWid;
  state.wardrobe=state.wardrobe.filter(function(i){return i.wid!==wid;});
  if(!state.isDemo&&state.accessToken){findSheetRow(wid).then(function(r){if(r)deleteSheetRow(r);});}
  closeDetailPanel();renderClosetGrid();
}

// === SECTION 17: Item Picker (swap) ===
function wireUpPicker(){document.getElementById('pickerBackdrop').addEventListener('click',closePicker);}
function openPicker(type,excludeWid,callback){
  state.pickerCallback=callback;
  var items=state.wardrobe.filter(function(i){return i.type===type&&i.wid!==excludeWid;});
  document.getElementById('pickerTitle').textContent='Pick a '+type.toLowerCase();
  var grid=document.getElementById('pickerGrid');
  grid.innerHTML=items.map(function(item){
    var ph=item.photoUrl?'<img src="'+esc(item.photoUrl)+'" alt="'+esc(item.name)+'" onerror="this.outerHTML=\''+item.emoji+'\'">':item.emoji;
    return '<div class="picker-item" data-wid="'+item.wid+'"><div class="picker-item-photo">'+ph+'</div><div class="picker-item-name">'+esc(item.name)+'</div></div>';
  }).join('');
  grid.querySelectorAll('.picker-item').forEach(function(el){el.addEventListener('click',function(){
    var picked=state.wardrobe.find(function(i){return i.wid===el.dataset.wid;});
    if(picked&&state.pickerCallback) state.pickerCallback(picked);closePicker();});});
  document.getElementById('pickerOverlay').classList.add('visible');
}
function closePicker(){document.getElementById('pickerOverlay').classList.remove('visible');state.pickerCallback=null;}

// === SECTION 18: Outfit Archive ===
function wireUpArchive(){document.getElementById('btnHistory').addEventListener('click',openArchive);document.getElementById('archiveClose').addEventListener('click',closeArchive);}
function openArchive(){
  var list=document.getElementById('archiveList');
  if(!state.archive.length){list.innerHTML='<p style="color:#999;text-align:center;padding:2rem;">No outfits approved yet.</p>';}
  else{list.innerHTML=state.archive.slice().reverse().map(function(entry){
    var items=[entry.topWid,entry.bottomWid,entry.shoesWid].map(function(w){return state.wardrobe.find(function(i){return i.wid===w;});}).filter(Boolean);
    return '<div class="archive-entry"><div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;"><strong>'+entry.date+'</strong><span style="font-size:0.8rem;color:#888;">Formality '+entry.formality+'</span></div>'+
      '<div style="display:flex;gap:0.4rem;">'+items.map(function(it){return '<div class="mini-thumb">'+(it.photoUrl?'<img src="'+esc(it.photoUrl)+'" alt="'+esc(it.name)+'" onerror="this.outerHTML=\''+it.emoji+'\'">':it.emoji)+'</div>';}).join('')+'</div>'+
      (entry.weather?'<div style="font-size:0.75rem;color:#888;margin-top:0.2rem;">'+esc(entry.weather)+'</div>':'')+'</div>';
  }).join('');}
  document.getElementById('archiveOverlay').classList.add('visible');
}
function closeArchive(){document.getElementById('archiveOverlay').classList.remove('visible');}

// === SECTION 19: Star rating helpers ===
function renderStarsHtml(r){return [1,2,3,4,5].map(function(n){return '<span class="star'+(n<=r?' filled':'')+'" data-star="'+n+'">\u2605</span>';}).join('');}
function wireUpStarRating(cid){document.getElementById(cid).addEventListener('click',function(e){var s=e.target.closest('.star');if(!s)return;var v=parseInt(s.dataset.star);
  document.getElementById(cid).querySelectorAll('.star').forEach(function(x,i){x.classList.toggle('filled',i<v);});});}
function getStarRating(cid){return document.getElementById(cid).querySelectorAll('.star.filled').length;}
function setStarRating(cid,r){document.getElementById(cid).querySelectorAll('.star').forEach(function(s,i){s.classList.toggle('filled',i<r);});}
function resetStarRating(cid){setStarRating(cid,0);}

// === SECTION 20: Utility functions ===
function toDateStr(d){var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day;}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function esc(s){if(!s)return '';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// Chip helpers
function wireUpSingleChips(cid){document.getElementById(cid).addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c)return;
  document.getElementById(cid).querySelectorAll('.chip').forEach(function(x){x.classList.remove('selected');});c.classList.add('selected');});}
function wireUpMultiChips(cid){document.getElementById(cid).addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c)return;c.classList.toggle('selected');});}
function getSelectedChip(cid){var s=document.getElementById(cid).querySelector('.chip.selected');return s?s.dataset.val:null;}
function getSelectedChips(cid){return Array.from(document.getElementById(cid).querySelectorAll('.chip.selected')).map(function(c){return c.dataset.val;});}
function selectChip(cid,val){document.getElementById(cid).querySelectorAll('.chip').forEach(function(c){c.classList.toggle('selected',c.dataset.val===val);});}
function selectMultiChips(cid,vals){document.getElementById(cid).querySelectorAll('.chip').forEach(function(c){c.classList.toggle('selected',vals.indexOf(c.dataset.val)>=0);});}
function resetChips(cid,def){document.getElementById(cid).querySelectorAll('.chip').forEach(function(c){c.classList.toggle('selected',def?c.dataset.val===def:false);});}
