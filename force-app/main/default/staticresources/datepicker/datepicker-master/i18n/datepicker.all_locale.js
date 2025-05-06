(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define('datepicker.fi-FI', ['jquery'], factory);
    define('datepicker.ja-JP', ['jquery'], factory);
    define('datepicker.pt-BR', ['jquery'], factory);
    define('datepicker.fr-FR', ['jquery'], factory);
    define('datepicker.ko-KR', ['jquery'], factory);
    define('datepicker.nl-NL', ['jquery'], factory);
    define('datepicker.pl-PL', ['jquery'], factory);
    define('datepicker.sk-SK', ['jquery'], factory);
    define('datepicker.sv-SE', ['jquery'], factory);
    define('datepicker.zh-CN', ['jquery'], factory);
    define('datepicker.tr-TR', ['jquery'], factory);
    define('datepicker.ca-ES', ['jquery'], factory);
    define('datepicker.cs-CZ', ['jquery'], factory);
    define('datepicker.da-DK', ['jquery'], factory);
    define('datepicker.de-DE', ['jquery'], factory);
    define('datepicker.en-GB', ['jquery'], factory);
    define('datepicker.en-US', ['jquery'], factory);
    define('datepicker.es-ES', ['jquery'], factory);
    define('datepicker.it-IT', ['jquery'], factory);
    define('datepicker.it-CH', ['jquery'], factory);
    define('datepicker.ar-JO', ['jquery'], factory);
    define('datepicker.en-ZA', ['jquery'], factory);
    define('datepicker.de-AT', ['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node / CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  'use strict';

  $.fn.datepicker.languages['fi-FI'] = {
    format: 'dd.mm.yyyy',
    days: ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'],
    daysShort: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
    daysMin: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
    weekStart: 1,
    months: ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'],
    monthsShort: ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu']
  };
  $.fn.datepicker.languages['ja-JP'] = {
    format: 'yyyy年mm月dd日',
    days: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    daysShort: ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'],
    daysMin: ['日', '月', '火', '水', '木', '金', '土'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekStart: 1,
    yearFirst: true,
    yearSuffix: '年'
  };
  $.fn.datepicker.languages['pt-BR'] = {
    format: 'dd/mm/yyyy',
    days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    daysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    daysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  };
  $.fn.datepicker.languages['fr-FR'] = {
    format: 'dd/mm/yyyy',
    days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    daysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    daysMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    weekStart: 1,
    months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthsShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jui', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  $.fn.datepicker.languages['ko-KR'] = {
    format: 'yyyy. mm. dd',
    days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    daysShort: ['일', '월', '화', '수', '목', '금', '토'],
    daysMin: ['일', '월', '화', '수', '목', '금', '토'],
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    weekStart: 1,
    yearFirst: true,
    yearSuffix: '년'
  };
  $.fn.datepicker.languages['nl-NL'] = {
    format: 'dd-mm-yyyy',
    days: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
    daysShort: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
    daysMin: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
    weekStart: 1,
    months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  };
  $.fn.datepicker.languages['pl-PL'] = {
    format: 'dd.mm.YYYY',
    days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
    daysShort: ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'],
    // Used and correct are only daysShort, daysMin are just shorted to fit UI
    daysMin: ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'],
    weekStart: 1,
    months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    monthsShort: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru']
  };
  $.fn.datepicker.languages['sk-SK'] = {
    format: 'dd.mm.YYYY',
    days: ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'],
    daysShort: ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'],
    daysMin: ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'],
    weekStart: 1,
    months: ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  };
  $.fn.datepicker.languages['sv-SE'] = {
    format: 'yyyy-mm-dd',
    days: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
    daysShort: ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'],
    daysMin: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
    weekStart: 1,
    months: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  };
  $.fn.datepicker.languages['zh-CN'] = {
    format: 'yyyy年mm月dd日',
    days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    daysMin: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekStart: 1,
    yearFirst: true,
    yearSuffix: '年'
  };
  $.fn.datepicker.languages['tr-TR'] = {
    format: 'dd.mm.yyyy',
    days: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    daysShort: ['Paz', 'Pts', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cts'],
    daysMin: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
    weekStart: 1,
    months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  };
  $.fn.datepicker.languages['ca-ES'] = {
    format: 'dd/mm/yyyy',
    days: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'],
    daysShort: ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
    daysMin: ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'],
    weekStart: 1,
    months: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'],
    monthsShort: ['gen.', 'febr.', 'març', 'abr.', 'maig', 'juny', 'jul.', 'ag.', 'set.', 'oct.', 'nov.', 'des.']
  };
  $.fn.datepicker.languages['cs-CZ'] = {
    format: 'dd.mm.YYYY',
    days: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
    daysShort: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    daysMin: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    weekStart: 1,
    months: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
    // Used everywhere, but probably not grammar correct
    monthsShort: ['Led', 'Úno', 'Bře', 'Dub', 'Květ', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro']
  };
  $.fn.datepicker.languages['da-DK'] = {
    format: 'dd-mm-yyyy',
    days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    daysShort: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
    daysMin: ['Sø', 'Ma', 'Ti', 'On', 'To', 'Fr', 'Lø'],
    weekStart: 1,
    months: ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  };
  $.fn.datepicker.languages['de-DE'] = {
    format: 'dd.mm.yyyy',
    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    daysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    daysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    weekStart: 1,
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  };
  $.fn.datepicker.languages['de-AT'] = $.fn.datepicker.languages['de-DE'];
  $.fn.datepicker.languages['en-GB'] = {
    format: 'dd/mm/yyyy'
  };
  $.fn.datepicker.languages['en-ZA'] = $.fn.datepicker.languages['en-GB'];
  $.fn.datepicker.languages['en-US'] = {
    format: 'mm/dd/yyyy'
  };
  $.fn.datepicker.languages['es-ES'] = {
    format: 'dd/mm/yyyy',
    days: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    daysShort: ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'],
    daysMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sa'],
    weekStart: 1,
    months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    monthsShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  };
  $.fn.datepicker.languages['it-IT'] = {
    format: 'dd/mm/yyy',
    days: ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
    daysShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
    daysMin: ['Do','Lu','Ma','Me','Gi','Ve','Sa'],
    weekStart: 1,
    months: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
    monthsShort: ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
  };
  $.fn.datepicker.languages['it-CH'] = $.fn.datepicker.languages['it-IT'];
  $.fn.datepicker.languages['ar-JO'] = {
    format: 'dd/mm/yy',
    days: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
    daysShort: ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'],
    daysMin: ['ح','ن','ث','ر','خ','ج','س'],
    weekStart: 1,
    months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    monthsShort: ['1','2','3','4','5','6','7','8','9','10','11','12']
  };
});
