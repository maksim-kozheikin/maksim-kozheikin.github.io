/* Shared action icons. External company links retain their existing 12 px SVG. */
const UI_PATHS = {
  arrow:"M12 19V5M6 11l6-6 6 6",
  chevron:"M3.5 1.5 7 5 3.5 8.5",
  download:"M12 3v12M7 10l5 5 5-5M5 20h14",
  home:"m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  close:"m6 6 12 12M18 6 6 18",
  plus:"M5 12h14M12 5v14", minus:"M5 12h14",
  menu:"M4 6h16M4 12h16M4 18h16", check:"m5 12 4 4L19 6"
};
function uiIcon(name){
  const direction={up:0,down:180,left:-90};
  const arrow=Object.prototype.hasOwnProperty.call(direction,name);
  const key=arrow?"arrow":name, small=key==="chevron", size=small?10:18;
  return `<svg class="ui-icon" data-ui-icon="${name}" viewBox="0 0 ${small?10:24} ${small?10:24}" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${small?1.8:2}" stroke-linecap="round" stroke-linejoin="round"${arrow?` style="transform:rotate(${direction[name]}deg)"`:""} aria-hidden="true"><path d="${UI_PATHS[key]}"></path></svg>`;
}
