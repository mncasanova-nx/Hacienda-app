import { useState, useEffect } from "react";

const SUPABASE_URL = "https://shjpqftwfdawncohirgv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoanBxZnR3ZmRhd25jb2hpcmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNjMwOTMsImV4cCI6MjA5NTkzOTA5M30.E18Daw9zTPoPHqNzePBQlH1T-KYAFopxZWz-8P-muRQ";

const CATEGORIAS = [
  "Vacas","Vaquillonas","Donantes","Receptoras","Terneros","Terneras",
  "Toritos MEJ","Vacas Rodeo General","Vacas Compra","Toros Rodeo General","Toros Compra",
  "Novillo","Novillito",
];

const TIPOS_RACION = ["Inicio","Recría","Terminación"];
const INSUMOS_DEFAULT = ["Maíz","Expeller de soja","Silaje de maíz","Silaje de sorgo","Heno","Núcleo vitamínico","Urea","Afrechillo","Cebada","Pellet de girasol"];
const SUPLEMENTOS_CAMPO = ["Pellet","Expeller de soja","Núcleo vitamínico","Sal","Otro"];

const CONSUMO_MS = {
  "Vacas":11,"Vaquillonas":8,"Donantes":12,"Receptoras":10,
  "Terneros":4.5,"Terneras":4,"Toritos MEJ":7,
  "Vacas Rodeo General":11,"Vacas Compra":11,"Toros Rodeo General":13,"Toros Compra":13,
};

const PASTURAS_DEFAULT = [
  {nombre:"Alfalfa",rendimiento:8000},{nombre:"Festuca",rendimiento:5000},
  {nombre:"Raigrás",rendimiento:6000},{nombre:"Sorgo",rendimiento:7000},
  {nombre:"Maíz",rendimiento:9000},{nombre:"Avena",rendimiento:4500},
  {nombre:"Triticale",rendimiento:5000},{nombre:"Pastura consociada",rendimiento:6000},
  {nombre:"Campo natural",rendimiento:2500},
];

const TIPOS_MOV = [
  {id:"entrada", label:"Entrada", icon:"↓", color:"#4ade80"},
  {id:"salida", label:"Salida", icon:"↑", color:"#f87171"},
  {id:"mov_interno", label:"Mov. Interno", icon:"↔", color:"#60a5fa"},
  {id:"traslado_campos", label:"Traslado entre Campos", icon:"⇄", color:"#f97316"},
  {id:"traslado_externo", label:"Traslado Externo", icon:"↗", color:"#e879f9"},
  {id:"paricion", label:"Parición", icon:"✦", color:"#fbbf24"},
  {id:"muerte", label:"Muerte", icon:"✕", color:"#a78bfa"},
  {id:"cambio_categoria", label:"Cambio de Categoría", icon:"⇅", color:"#2dd4bf"},
];

const CAMPOS = [
  {id:"el-prado", nombre:"El Prado"},
  {id:"la-envidia", nombre:"La Envidia"},
  {id:"guayascate", nombre:"Guayascate"},
];

const CORRALES_COMPARTIDOS = [
  {id:"prado-corral-1",         nombre:"Corral 1",             campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-corral-2",         nombre:"Corral 2",             campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-corral-3",         nombre:"Corral 3",             campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-corral-4",         nombre:"Corral 4",             campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-corral-5",         nombre:"Corral 5",             campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-corral-6",         nombre:"Corral 6",             campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-vidriera-1",       nombre:"Vidriera 1",           campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-vidriera-2",       nombre:"Vidriera 2",           campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-vidriera-3",       nombre:"Vidriera 3",           campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-vidriera-4",       nombre:"Vidriera 4",           campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-encenada-10",      nombre:"Encenada del 10",      campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-encenada-12",      nombre:"Encenada del 12",      campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-encenada-13",      nombre:"Encenada del 13",      campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-encenada-14",      nombre:"Encenada del 14",      campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-encenada-18",      nombre:"Encenada del 18",      campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-encenada-19",      nombre:"Encenada del 19",      campoId:"compartido", tipo:"corral", compartido:true},
  {id:"prado-represa",          nombre:"Corral de la Represa", campoId:"compartido", tipo:"corral", compartido:true},
  {id:"compartido-corral-alto", nombre:"Corral del Alto",      campoId:"compartido", tipo:"corral", compartido:true},
  ...Array.from({length:24}, (_,i) => ({
    id:"lote-compartido-"+(i+1), nombre:"Lote "+(i+1), campoId:"compartido", tipo:"lote", compartido:true
  })),
];

const CORRALES_GUAYASCATE = Array.from({length:6}, (_,i) => ({
  id:"guayascate-lote-"+(i+1), nombre:"Lote "+(i+1), campoId:"guayascate", tipo:"lote", compartido:false
}));

const CORRALES_INICIALES = [
  ...CORRALES_COMPARTIDOS,
  ...CORRALES_GUAYASCATE,
];

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const todayStr = () => new Date().toISOString().split("T")[0];
const fmtFecha = (f) => { if(!f) return ""; var p=f.split("-"); return parseInt(p[2])+" de "+MESES[parseInt(p[1])-1]+" "+p[0]; };
const diffDias = (f1,f2) => { if(!f1||!f2) return 0; return Math.max(0,Math.round((new Date(f2)-new Date(f1))/86400000)); };
const fmtNum = (n) => Math.round(n).toLocaleString("es-AR");

function calcularStock(corrales, movs) {
  const stock={};
  corrales.forEach(function(c){ stock[c.id]={}; CATEGORIAS.forEach(function(cat){ stock[c.id][cat]=0; }); });
  movs.forEach(function(m){
    var corralObj=corrales.find(function(c){ return c.id===m.corral; });
    var corralDestinoObj=corrales.find(function(c){ return c.id===m.corralDestino; });
    // Para corrales compartidos, usar campoPropietario para determinar a qué campo pertenece
    var campoCorral=corralObj&&corralObj.compartido?m.campoPropietario:corralObj?corralObj.campoId:null;
    var campoDestino=corralDestinoObj&&corralDestinoObj.compartido?m.campoPropietario:corralDestinoObj?corralDestinoObj.campoId:null;
    if(m.tipo==="entrada"||m.tipo==="paricion"){ if(stock[m.corral]) stock[m.corral][m.categoria]=(stock[m.corral][m.categoria]||0)+Number(m.cantidad); }
    else if(m.tipo==="salida"||m.tipo==="muerte"||m.tipo==="traslado_externo"){ if(stock[m.corral]) stock[m.corral][m.categoria]=(stock[m.corral][m.categoria]||0)-Number(m.cantidad); }
    else if(m.tipo==="mov_interno"||m.tipo==="traslado_campos"){
      if(stock[m.corral]) stock[m.corral][m.categoria]=(stock[m.corral][m.categoria]||0)-Number(m.cantidad);
      if(m.corralDestino&&stock[m.corralDestino]) stock[m.corralDestino][m.categoria]=(stock[m.corralDestino][m.categoria]||0)+Number(m.cantidad);
    }
    else if(m.tipo==="cambio_categoria"){
      if(stock[m.corral]){
        stock[m.corral][m.categoria]=(stock[m.corral][m.categoria]||0)-Number(m.cantidad);
        if(m.categoriaDestino) stock[m.corral][m.categoriaDestino]=(stock[m.corral][m.categoriaDestino]||0)+Number(m.cantidad);
      }
    }
    if(corralObj&&corralObj.compartido&&m.campoPropietario){ corralObj._campoPropietario=m.campoPropietario; }
  });
  return stock;
}

function calcularHistorialLotes(corrales, movs) {
  var porCorral={};
  corrales.forEach(function(c){ porCorral[c.id]=[]; });
  var sorted=[].concat(movs).sort(function(a,b){ return a.fecha>b.fecha?1:-1; });
  sorted.forEach(function(m){
    var items=[];
    if(m.tipo==="mov_interno"||m.tipo==="traslado_campos"){ items.push({id:m.corral,tipo:"salida"}); if(m.corralDestino) items.push({id:m.corralDestino,tipo:"entrada"}); }
    else if(m.tipo==="traslado_externo"){ items.push({id:m.corral,tipo:"salida"}); }
    else items.push({id:m.corral,tipo:m.tipo});
    items.forEach(function(x){ if(porCorral[x.id]) porCorral[x.id].push({fecha:m.fecha,tipo:x.tipo,categoria:m.categoria,cantidad:Number(m.cantidad)}); });
  });
  var historial=[];
  corrales.forEach(function(c){
    var eventos=porCorral[c.id]||[];
    var entradas=eventos.filter(function(e){ return e.tipo==="entrada"||e.tipo==="paricion"; });
    var salidas=eventos.filter(function(e){ return e.tipo==="salida"||e.tipo==="muerte"; });
    if(entradas.length===0) return;
    var fechaEntrada=entradas[0].fecha;
    var fechaSalida=salidas.length>0?salidas[salidas.length-1].fecha:todayStr();
    var dias=diffDias(fechaEntrada,fechaSalida)||1;
    var porCat={};
    entradas.forEach(function(e){ porCat[e.categoria]=(porCat[e.categoria]||0)+e.cantidad; });
    historial.push({corralId:c.id,nombre:c.nombre,fechaEntrada:fechaEntrada,fechaSalida:fechaSalida,dias:dias,porCat:porCat});
  });
  return historial;
}

function Badge(props) {
  var t=TIPOS_MOV.find(function(x){ return x.id===props.tipo; })||TIPOS_MOV[0];
  return (
    <span style={{background:t.color+"22",color:t.color,border:"1px solid "+t.color+"55",borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:4}}>
      {t.icon} {t.label}
    </span>
  );
}

export default function App() {
  const SB = {
    h: function(extra) {
      var base = {"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY,"Content-Type":"application/json","Prefer":"return=representation"};
      if(extra) Object.assign(base,extra);
      return base;
    },
    get: function(table) {
      return fetch(SUPABASE_URL+"/rest/v1/"+table+"?order=id.desc",{headers:SB.h()})
        .then(function(r){ return r.ok?r.json():Promise.resolve([]); })
        .catch(function(){ return []; });
    },
    insert: function(table, row) {
      return fetch(SUPABASE_URL+"/rest/v1/"+table,{method:"POST",headers:SB.h(),body:JSON.stringify(row)})
        .then(function(r){ return r.ok?r.json():null; })
        .catch(function(){ return null; });
    },
    del: function(table, id) {
      var h=SB.h(); h["Prefer"]="";
      return fetch(SUPABASE_URL+"/rest/v1/"+table+"?id=eq."+id,{method:"DELETE",headers:h})
        .then(function(){ return true; }).catch(function(){ return false; });
    },
    upsert: function(table, row) {
      var h=SB.h(); h["Prefer"]="resolution=merge-duplicates,return=representation";
      return fetch(SUPABASE_URL+"/rest/v1/"+table,{method:"POST",headers:h,body:JSON.stringify(row)})
        .then(function(r){ return r.ok?r.json():null; })
        .catch(function(){ return null; });
    }
  };

  const [corrales, setCorrales] = useState(CORRALES_INICIALES);
  const [movimientos, setMovimientos] = useState([]);
  const [descargas, setDescargas] = useState([]);
  const [suplementos, setSuplementos] = useState([]);
  const [lotesPastura, setLotesPastura] = useState({});
  const [campoFiltro, setCampoFiltro] = useState("el-prado");
  const [vista, setVista] = useState("registrar");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [nuevoCorral, setNuevoCorral] = useState("");
  const [filtroCorral, setFiltroCorral] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [vistaCorral, setVistaCorral] = useState("prado-corral-1");
  const [form, setForm] = useState({
    fecha:todayStr(), tipo:"entrada", corral:"prado-corral-1", corralDestino:"prado-corral-2",
    campoPropietario:"el-prado", destinoExterno:"", categoria:CATEGORIAS[0], categoriaDestino:CATEGORIAS[1], cantidad:"", observaciones:""
  });
  const [descForm, setDescForm] = useState({
    fecha:todayStr(), corralId:"prado-corral-1", tipoRacion:"Inicio", kgTotales:"",
    insumos:[{nombre:INSUMOS_DEFAULT[0],kg:""}]
  });
  const [suplForm, setSuplForm] = useState({
    loteId:"prado-corral-1", fechaDesde:todayStr(), fechaHasta:todayStr(),
    suplemento:SUPLEMENTOS_CAMPO[0], kgTotales:"", animales:"", observaciones:""
  });
  const [pasturaForm, setPasturaForm] = useState({pastura:PASTURAS_DEFAULT[0].nombre,hectareas:"",rendimiento:PASTURAS_DEFAULT[0].rendimiento});

  const showToast = function(msg,ok) {
    if(ok===undefined) ok=true;
    setToast({msg:msg,ok:ok});
    setTimeout(function(){ setToast(null); },3000);
  };

  useEffect(function(){
    setLoading(true);
    Promise.all([SB.get("movimientos"),SB.get("corrales"),SB.get("descargas"),SB.get("lotes_pastura"),SB.get("suplementos")])
      .then(function(results){
        var movs=results[0], cors=results[1], desc=results[2], past=results[3], supl=results[4];
        if(movs&&movs.length) setMovimientos(movs.map(function(m){
          return {id:m.id,fecha:m.fecha,tipo:m.tipo,corral:m.corral,corralDestino:m.corral_destino,
            campoPropietario:m.campo_propietario,destinoExterno:m.destino_externo,
            categoria:m.categoria,categoriaDestino:m.categoria_destino,cantidad:m.cantidad,observaciones:m.observaciones};
        }));
        if(cors&&cors.length) setCorrales(cors.map(function(c){
          return {id:c.id,nombre:c.nombre,campoId:c.campo_id,tipo:c.tipo,compartido:c.compartido};
        }));
        else {
          setCorrales(CORRALES_INICIALES);
          var rows=CORRALES_INICIALES.map(function(c){ return {id:c.id,nombre:c.nombre,campo_id:c.campoId,tipo:c.tipo,compartido:c.compartido}; });
          rows.forEach(function(r){ SB.insert("corrales",r); });
        }
        if(desc&&desc.length) setDescargas(desc.map(function(d){
          return {id:d.id,fecha:d.fecha,corralId:d.corral_id,tipoRacion:d.tipo_racion,kgTotales:d.kg_totales,insumos:d.insumos||[]};
        }));
        if(past&&past.length){
          var obj={};
          past.forEach(function(p){ obj[p.corral_id]={pastura:p.pastura,hectareas:p.hectareas,rendimiento:p.rendimiento}; });
          setLotesPastura(obj);
        }
        if(supl&&supl.length) setSuplementos(supl.map(function(s){
          return {id:s.id,loteId:s.lote_id,fechaDesde:s.fecha_desde,fechaHasta:s.fecha_hasta,
            suplemento:s.suplemento,kgTotales:s.kg_totales,animales:s.animales,kgAnimalDia:s.kg_animal_dia,dias:s.dias,observaciones:s.observaciones};
        }));
        setLoading(false);
      });
  },[]);

  var guardarMovimiento = function() {
    if(!form.cantidad||isNaN(form.cantidad)||Number(form.cantidad)<=0){ showToast("Ingresá una cantidad válida",false); return; }
    var id=Date.now();
    var row={id:id,fecha:form.fecha,tipo:form.tipo,corral:form.corral,
      corral_destino:form.corralDestino||null,campo_propietario:form.campoPropietario||null,
      destino_externo:form.destinoExterno||null,categoria:form.categoria,
      categoria_destino:form.tipo==="cambio_categoria"?form.categoriaDestino:null,
      cantidad:Number(form.cantidad),observaciones:form.observaciones||null};
    SB.insert("movimientos",row).then(function(res){
      if(res){ setMovimientos(function(l){ return [{...form,id:id}].concat(l); }); setForm(function(f){ return {...f,cantidad:"",observaciones:""}; }); showToast("Movimiento registrado ✓"); }
      else showToast("Error al guardar",false);
    });
  };

  var eliminarMovimiento = function(id) {
    SB.del("movimientos",id).then(function(){ setMovimientos(function(l){ return l.filter(function(m){ return m.id!==id; }); }); showToast("Eliminado"); });
  };

  var guardarDescarga = function() {
    if(!descForm.kgTotales||Number(descForm.kgTotales)<=0){ showToast("Ingresá los kg totales",false); return; }
    var id=Date.now();
    var row={id:id,fecha:descForm.fecha,corral_id:descForm.corralId,tipo_racion:descForm.tipoRacion,kg_totales:Number(descForm.kgTotales),insumos:descForm.insumos};
    SB.insert("descargas",row).then(function(res){
      if(res){ setDescargas(function(l){ return [{...descForm,id:id}].concat(l); }); setDescForm(function(f){ return {...f,kgTotales:"",insumos:[{nombre:INSUMOS_DEFAULT[0],kg:""}]}; }); showToast("Descarga registrada ✓"); }
      else showToast("Error al guardar",false);
    });
  };

  var guardarSuplemento = function() {
    if(!suplForm.kgTotales||Number(suplForm.kgTotales)<=0){ showToast("Ingresá los kg totales",false); return; }
    if(!suplForm.animales||Number(suplForm.animales)<=0){ showToast("Ingresá la cantidad de animales",false); return; }
    var dias=diffDias(suplForm.fechaDesde,suplForm.fechaHasta)||1;
    var kgAnimalDia=Number(suplForm.kgTotales)/Number(suplForm.animales)/dias;
    var id=Date.now();
    var row={id:id,lote_id:suplForm.loteId,fecha_desde:suplForm.fechaDesde,fecha_hasta:suplForm.fechaHasta,
      suplemento:suplForm.suplemento,kg_totales:Number(suplForm.kgTotales),animales:Number(suplForm.animales),
      kg_animal_dia:kgAnimalDia,dias:dias,observaciones:suplForm.observaciones||null};
    SB.insert("suplementos",row).then(function(res){
      if(res){ setSuplementos(function(l){ return [{...suplForm,id:id,dias:dias,kgAnimalDia:kgAnimalDia}].concat(l); }); setSuplForm(function(f){ return {...f,kgTotales:"",animales:"",observaciones:""}; }); showToast("Suplementación registrada ✓"); }
      else showToast("Error al guardar",false);
    });
  };

  var agregarCorral = function() {
    if(!nuevoCorral.trim()) return;
    var id="corral-"+Date.now();
    var nuevo={id:id,nombre:nuevoCorral.trim(),campoId:campoFiltro,tipo:"corral",compartido:false};
    SB.insert("corrales",{id:id,nombre:nuevo.nombre,campo_id:campoFiltro,tipo:"corral",compartido:false}).then(function(res){
      if(res){ setCorrales(function(l){ return l.concat([nuevo]); }); setNuevoCorral(""); showToast(nuevo.nombre+" agregado"); }
      else showToast("Error al guardar",false);
    });
  };

  var guardarPastura = function(corralId) {
    if(!pasturaForm.hectareas||Number(pasturaForm.hectareas)<=0){ showToast("Ingresá las hectáreas",false); return; }
    var row={corral_id:corralId,pastura:pasturaForm.pastura,hectareas:Number(pasturaForm.hectareas),rendimiento:Number(pasturaForm.rendimiento)};
    SB.upsert("lotes_pastura",row).then(function(res){
      if(res){ setLotesPastura(function(p){ var n={...p}; n[corralId]={...pasturaForm}; return n; }); setLoteSeleccionado(null); showToast("Pastura guardada ✓"); }
      else showToast("Error al guardar",false);
    });
  };

  var exportarPDF = function() {
    var fecha = new Date().toLocaleDateString("es-AR", {day:"numeric",month:"long",year:"numeric"});
    var win = window.open("","_blank");
    var cn = function(id){ var c=corrales.find(function(x){ return x.id===id; }); return c?c.nombre:id; };

    var stockHTML = CAMPOS.map(function(campo) {
      var ids = corrales.filter(function(c){ return c.campoId===campo.id||c.compartido; }).map(function(c){ return c.id; });
      var tot = {}; CATEGORIAS.forEach(function(c){ tot[c]=0; });
      movimientos.forEach(function(m){
        if(ids.includes(m.corral)){
          if(m.tipo==="entrada"||m.tipo==="paricion") tot[m.categoria]=(tot[m.categoria]||0)+Number(m.cantidad);
          else if(m.tipo==="salida"||m.tipo==="muerte"||m.tipo==="traslado_externo") tot[m.categoria]=(tot[m.categoria]||0)-Number(m.cantidad);
        }
        if((m.tipo==="mov_interno"||m.tipo==="traslado_campos")&&m.corralDestino&&ids.includes(m.corralDestino)) tot[m.categoria]=(tot[m.categoria]||0)+Number(m.cantidad);
        if((m.tipo==="mov_interno"||m.tipo==="traslado_campos")&&ids.includes(m.corral)) tot[m.categoria]=(tot[m.categoria]||0)-Number(m.cantidad);
      });
      var cats = CATEGORIAS.filter(function(c){ return tot[c]>0; });
      var total = cats.reduce(function(a,c){ return a+tot[c]; },0);
      if(total===0) return '<div class="seccion"><h3>'+campo.nombre+' — sin hacienda registrada</h3></div>';
      return '<div class="seccion"><h3>'+campo.nombre+' — '+total+' animales</h3><table><tr>'+
        cats.map(function(c){ return '<td><b>'+c+'</b><br>'+tot[c]+'</td>'; }).join("")+
        '</tr></table></div>';
    }).join("");

    var movHTML = movimientos.slice(0,500).map(function(m){
      var t = TIPOS_MOV.find(function(x){ return x.id===m.tipo; })||TIPOS_MOV[0];
      return '<tr><td>'+m.fecha+'</td><td>'+t.label+'</td><td>'+m.cantidad+' x '+m.categoria+'</td><td>'+cn(m.corral)+(m.corralDestino?' -> '+cn(m.corralDestino):'')+'</td><td>'+(m.observaciones||'')+'</td></tr>';
    }).join("");

    var reporteHTML = movimientos.slice(0,500).map(function(m){
      var txt = "";
      if(m.tipo==="entrada") txt="El dia "+fmtFecha(m.fecha)+", ingresaron "+m.cantidad+" "+m.categoria+" al "+cn(m.corral)+".";
      else if(m.tipo==="salida") txt="El dia "+fmtFecha(m.fecha)+", salieron "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+".";
      else if(m.tipo==="mov_interno") txt="El dia "+fmtFecha(m.fecha)+", se movieron "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+" al "+cn(m.corralDestino)+".";
      else if(m.tipo==="traslado_campos") txt="El dia "+fmtFecha(m.fecha)+", se trasladaron "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+" al "+cn(m.corralDestino)+".";
      else if(m.tipo==="traslado_externo") txt="El dia "+fmtFecha(m.fecha)+", salieron "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+" hacia "+(m.destinoExterno||"destino externo")+".";
      else if(m.tipo==="paricion") txt="El dia "+fmtFecha(m.fecha)+", se registraron "+m.cantidad+" pariciones de "+m.categoria+" en el "+cn(m.corral)+".";
      else if(m.tipo==="muerte") txt="El dia "+fmtFecha(m.fecha)+", fallecieron "+m.cantidad+" "+m.categoria+" en el "+cn(m.corral)+".";
      return '<p>'+txt+'</p>';
    }).join("");

    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>HyH Ganadera - Reporte</title><style>'+
      'body{font-family:Georgia,serif;color:#222;margin:40px;font-size:13px;}'+
      'h2{font-size:16px;border-bottom:2px solid #b5925a;padding-bottom:6px;margin-top:30px;color:#7a5a2a;}'+
      'h3{font-size:14px;margin:10px 0 6px;}'+
      '.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;border-bottom:3px solid #b5925a;padding-bottom:16px;}'+
      '.header-title{font-size:28px;font-weight:bold;color:#7a5a2a;letter-spacing:2px;}'+
      '.header-sub{font-size:12px;color:#888;margin-top:4px;}'+
      '.seccion{margin-bottom:16px;}'+
      'table{border-collapse:collapse;width:100%;margin-top:8px;font-size:12px;}'+
      'td,th{border:1px solid #ddd;padding:6px 10px;text-align:left;}'+
      'th{background:#f5ede0;font-weight:bold;color:#7a5a2a;}'+
      'tr:nth-child(even){background:#fafafa;}'+
      'p{margin:4px 0;line-height:1.7;}'+
      '</style></head><body>'+
      '<div class="header">'+
        '<div>'+
          '<div class="header-title">HyH Ganadera</div>'+
          '<div class="header-sub">Registro de Hacienda</div>'+
        '</div>'+
        '<div style="text-align:right;font-size:12px;color:#888;">'+
          'Generado el '+fecha+'<br>'+
          movimientos.length+' movimientos registrados'+
        '</div>'+
      '</div>'+
      '<h2>Stock Actual por Campo</h2>'+stockHTML+
      '<h2>Historial de Movimientos</h2>'+
      '<table><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Corral</th><th>Observaciones</th></tr>'+movHTML+'</table>'+
      '<h2>Reporte Narrativo</h2>'+reporteHTML+
      '</body></html>');
    win.document.close();
    win.focus();
    setTimeout(function(){ win.print(); }, 500);
  };

  const stock=calcularStock(corrales,movimientos);
  const historialLotes=calcularHistorialLotes(corrales,movimientos);
  const corralNombre=function(id){ var c=corrales.find(function(x){ return x.id===id; }); return c?c.nombre:id; };
  const corralesPropios=corrales.filter(function(c){ return c.campoId===campoFiltro&&c.tipo==="corral"; });
  const lotesCompartidos=corrales.filter(function(c){ return c.compartido; });
  const movFiltrados=movimientos.filter(function(m){
    if(filtroCorral!=="todos"&&m.corral!==filtroCorral&&m.corralDestino!==filtroCorral) return false;
    if(filtroTipo!=="todos"&&m.tipo!==filtroTipo) return false;
    return true;
  });

  const S={
    input:{background:"#1e2233",border:"1px solid #2a2f3e",borderRadius:6,color:"#e8dcc8",padding:"9px 12px",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none"},
    label:{display:"block",fontSize:11,letterSpacing:1.5,color:"#8a7e6a",textTransform:"uppercase",marginBottom:6},
    card: {background:"#161a24",border:"1px solid #2a2f3e",borderRadius:12,padding:20},
  };

  const navItems=[["registrar","+ Registrar"],["mixer","Mixer"],["suplementacion","Suplementacion"],["historial","Historial"],["reporte","Reporte"],["lotes","Lotes"],["stock","Stock"]];

  return (
    <div style={{minHeight:"100vh",background:"#0f1117",color:"#e8e3d8",fontFamily:"Georgia,serif"}}>
      {loading&&(
        <div style={{position:"fixed",inset:0,background:"#0f1117dd",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
          <div style={{width:40,height:40,border:"4px solid #2a2f3e",borderTop:"4px solid #b5925a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          <div style={{color:"#b5925a",fontSize:14,fontWeight:600}}>Cargando datos...</div>
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      )}
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:999,background:toast.ok?"#1a3a2a":"#3a1a1a",border:"1px solid "+(toast.ok?"#4ade80":"#f87171"),color:toast.ok?"#4ade80":"#f87171",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:"#161a24",borderBottom:"1px solid #2a2f3e",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{fontSize:20,fontWeight:700,color:"#e8dcc8"}}>Registro de Hacienda</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {navItems.map(function(item){
            return <button key={item[0]} onClick={function(){ setVista(item[0]); }} style={{background:vista===item[0]?"#b5925a":"#1e2233",color:vista===item[0]?"#fff":"#8a7e6a",border:"1px solid "+(vista===item[0]?"#b5925a":"#2a2f3e"),borderRadius:6,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>{item[1]}</button>;
          })}
          <button onClick={exportarPDF} style={{background:"#2a1f10",color:"#e8c87a",border:"1px solid #b5925a",borderRadius:6,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>PDF</button>
        </div>
      </div>

      <div style={{background:"#0f1117",borderBottom:"1px solid #1e2233",padding:"8px 20px",display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:11,color:"#8a7e6a",letterSpacing:1.5,textTransform:"uppercase",marginRight:4}}>Campo:</span>
        {CAMPOS.map(function(cp){
          return <button key={cp.id} onClick={function(){ setCampoFiltro(cp.id); }} style={{background:campoFiltro===cp.id?"#2a1f10":"#1e2233",color:campoFiltro===cp.id?"#e8c87a":"#8a7e6a",border:"1px solid "+(campoFiltro===cp.id?"#b5925a":"#2a2f3e"),borderRadius:6,padding:"5px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>{cp.nombre}</button>;
        })}
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"20px 14px"}}>

        {vista==="registrar"&&(
          <div style={{display:"grid",gap:18}}>
            <div style={S.card}>
              <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:18}}>Nuevo Movimiento</div>
              <div style={{marginBottom:14}}>
                <label style={S.label}>Tipo</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {TIPOS_MOV.map(function(t){
                    return <button key={t.id} onClick={function(){ setForm(function(f){ return {...f,tipo:t.id}; }); }} style={{background:form.tipo===t.id?t.color+"22":"#1e2233",color:form.tipo===t.id?t.color:"#8a7e6a",border:"1px solid "+(form.tipo===t.id?t.color:"#2a2f3e"),borderRadius:6,padding:"7px 13px",cursor:"pointer",fontSize:13,fontWeight:600}}>{t.icon} {t.label}</button>;
                  })}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={S.label}>Fecha</label><input type="date" value={form.fecha} onChange={function(e){ setForm(function(f){ return {...f,fecha:e.target.value}; }); }} style={S.input}/></div>
                <div><label style={S.label}>Categoria</label><select value={form.categoria} onChange={function(e){ setForm(function(f){ return {...f,categoria:e.target.value}; }); }} style={S.input}>{CATEGORIAS.map(function(c){ return <option key={c}>{c}</option>; })}</select></div>
                <div>
                  <label style={S.label}>Corral / Lote</label>
                  <select value={form.corral} onChange={function(e){ setForm(function(f){ return {...f,corral:e.target.value}; }); }} style={S.input}>
                    {corralesPropios.length>0&&<optgroup label="Corrales propios">{corralesPropios.map(function(c){ return <option key={c.id} value={c.id}>{c.nombre}</option>; })}</optgroup>}
                    <optgroup label="Compartidos (El Prado / La Envidia)">{lotesCompartidos.map(function(c){ return <option key={c.id} value={c.id}>{c.nombre}</option>; })}</optgroup>
                    {campoFiltro==="guayascate"&&corrales.filter(function(c){ return c.campoId==="guayascate"; }).map(function(c){ return <option key={c.id} value={c.id}>{c.nombre}</option>; })}
                  </select>
                </div>
                <div><label style={S.label}>Cantidad</label><input type="number" min="1" placeholder="0" value={form.cantidad} onChange={function(e){ setForm(function(f){ return {...f,cantidad:e.target.value}; }); }} style={S.input}/></div>
              </div>
              {form.tipo==="mov_interno"&&(
                <div style={{marginTop:12}}>
                  <label style={S.label}>Destino (mismo campo)</label>
                  <select value={form.corralDestino} onChange={function(e){ setForm(function(f){ return {...f,corralDestino:e.target.value}; }); }} style={S.input}>
                    {corralesPropios.map(function(c){ return <option key={c.id} value={c.id}>{c.nombre}</option>; })}
                    {lotesCompartidos.map(function(c){ return <option key={c.id} value={c.id}>{c.nombre}</option>; })}
                  </select>
                </div>
              )}
              {form.tipo==="traslado_campos"&&(
                <div style={{marginTop:12}}>
                  <label style={S.label}>Destino (otro campo)</label>
                  <select value={form.corralDestino} onChange={function(e){ setForm(function(f){ return {...f,corralDestino:e.target.value}; }); }} style={S.input}>
                    {CAMPOS.filter(function(cp){ return cp.id!==campoFiltro; }).map(function(cp){
                      var cors=corrales.filter(function(c){ return c.campoId===cp.id||c.compartido; });
                      return <optgroup key={cp.id} label={cp.nombre}>{cors.map(function(c){ return <option key={cp.id+c.id} value={c.id}>{c.nombre}</option>; })}</optgroup>;
                    })}
                  </select>
                </div>
              )}
              {form.tipo==="traslado_externo"&&(
                <div style={{marginTop:12}}>
                  <label style={S.label}>Destino externo</label>
                  <input value={form.destinoExterno} onChange={function(e){ setForm(function(f){ return {...f,destinoExterno:e.target.value}; }); }} placeholder="Ej: Establecimiento Don Juan, remate..." style={S.input}/>
                </div>
              )}
              {form.tipo==="cambio_categoria"&&(
                <div style={{marginTop:12}}>
                  <label style={S.label}>Categoria destino</label>
                  <select value={form.categoriaDestino} onChange={function(e){ setForm(function(f){ return {...f,categoriaDestino:e.target.value}; }); }} style={S.input}>
                    {CATEGORIAS.filter(function(c){ return c!==form.categoria; }).map(function(c){ return <option key={c}>{c}</option>; })}
                  </select>
                  {(function(){
                    var s=stock[form.corral]||{};
                    var disponible=s[form.categoria]||0;
                    return disponible>0?<div style={{marginTop:6,fontSize:12,color:"#8a9ab0"}}>Disponibles en este corral: <strong style={{color:"#e8dcc8"}}>{disponible} {form.categoria}</strong></div>:
                    <div style={{marginTop:6,fontSize:12,color:"#f87171"}}>No hay {form.categoria} en este corral</div>;
                  })()}
                </div>
              )}
              {corrales.find(function(c){ return c.id===form.corral; })&&corrales.find(function(c){ return c.id===form.corral; }).compartido&&(
                <div style={{marginTop:12,background:"#1a1f2e",border:"1px solid #2a3048",borderRadius:8,padding:12}}>
                  <label style={{...S.label,color:"#60a5fa"}}>A que campo pertenece esta hacienda?</label>
                  <div style={{display:"flex",gap:8}}>
                    {["el-prado","la-envidia"].map(function(cid){
                      var cp=CAMPOS.find(function(x){ return x.id===cid; });
                      return <button key={cid} onClick={function(){ setForm(function(f){ return {...f,campoPropietario:cid}; }); }} style={{background:form.campoPropietario===cid?"#1a2a4a":"#1e2233",color:form.campoPropietario===cid?"#60a5fa":"#8a7e6a",border:"1px solid "+(form.campoPropietario===cid?"#60a5fa":"#2a2f3e"),borderRadius:6,padding:"7px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>{cp?cp.nombre:cid}</button>;
                    })}
                  </div>
                </div>
              )}
              <div style={{marginTop:12}}><label style={S.label}>Observaciones</label><textarea value={form.observaciones} onChange={function(e){ setForm(function(f){ return {...f,observaciones:e.target.value}; }); }} rows={2} style={{...S.input,resize:"vertical"}}/></div>
              <button onClick={guardarMovimiento} style={{marginTop:16,background:"#b5925a",color:"#fff",border:"none",borderRadius:8,padding:"11px 0",cursor:"pointer",fontSize:15,fontWeight:700,width:"100%"}}>Registrar Movimiento</button>
            </div>
            <div style={S.card}>
              <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:12}}>Agregar Corral / Lote a {CAMPOS.find(function(c){ return c.id===campoFiltro; })?CAMPOS.find(function(c){ return c.id===campoFiltro; }).nombre:""}</div>
              <div style={{display:"flex",gap:10}}>
                <input value={nuevoCorral} onChange={function(e){ setNuevoCorral(e.target.value); }} placeholder="Nombre..." style={{...S.input,flex:1}} onKeyDown={function(e){ if(e.key==="Enter") agregarCorral(); }}/>
                <button onClick={agregarCorral} style={{background:"#1e2233",color:"#b5925a",border:"1px solid #b5925a",borderRadius:6,padding:"8px 18px",cursor:"pointer",fontSize:14,fontWeight:700}}>+</button>
              </div>
            </div>
          </div>
        )}

        {vista==="mixer"&&(
          <div style={{display:"grid",gap:18}}>
            <div style={S.card}>
              <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:12}}>Corral activo</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {corrales.filter(function(c){ return c.campoId===campoFiltro||c.compartido; }).map(function(c){
                  return <button key={c.id} onClick={function(){ setVistaCorral(c.id); setDescForm(function(f){ return {...f,corralId:c.id}; }); }} style={{background:vistaCorral===c.id?"#1a2a4a":"#1e2233",color:vistaCorral===c.id?"#60a5fa":"#8a7e6a",border:"1px solid "+(vistaCorral===c.id?"#60a5fa":"#2a2f3e"),borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>{c.nombre}</button>;
                })}
              </div>
            </div>
            <div style={S.card}>
              <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:14}}>Registrar Descarga de Mixer</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
                <div><label style={S.label}>Fecha</label><input type="date" value={descForm.fecha} onChange={function(e){ setDescForm(function(f){ return {...f,fecha:e.target.value}; }); }} style={S.input}/></div>
                <div>
                  <label style={S.label}>Tipo de racion</label>
                  <div style={{display:"flex",gap:5}}>
                    {TIPOS_RACION.map(function(r){
                      var col=r==="Inicio"?"#60a5fa":r==="Recria"?"#fbbf24":"#4ade80";
                      return <button key={r} onClick={function(){ setDescForm(function(f){ return {...f,tipoRacion:r}; }); }} style={{background:descForm.tipoRacion===r?col+"22":"#1e2233",color:descForm.tipoRacion===r?col:"#8a7e6a",border:"1px solid "+(descForm.tipoRacion===r?col:"#2a2f3e"),borderRadius:6,padding:"7px 8px",cursor:"pointer",fontSize:12,fontWeight:700,flex:1}}>{r}</button>;
                    })}
                  </div>
                </div>
                <div><label style={S.label}>Kg Totales</label><input type="number" min="0" placeholder="0" value={descForm.kgTotales} onChange={function(e){ setDescForm(function(f){ return {...f,kgTotales:e.target.value}; }); }} style={S.input}/></div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <label style={S.label}>Insumos</label>
                  <button onClick={function(){ setDescForm(function(f){ return {...f,insumos:f.insumos.concat([{nombre:INSUMOS_DEFAULT[0],kg:""}])}; }); }} style={{background:"#1e2233",color:"#60a5fa",border:"1px solid #2a3a5e",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12}}>+ Insumo</button>
                </div>
                {descForm.insumos.map(function(ins,i){
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,marginBottom:8,alignItems:"center"}}>
                      <select value={ins.nombre} onChange={function(e){ var arr=descForm.insumos.slice(); arr[i]={...arr[i],nombre:e.target.value}; setDescForm(function(f){ return {...f,insumos:arr}; }); }} style={S.input}>{INSUMOS_DEFAULT.map(function(n){ return <option key={n}>{n}</option>; })}</select>
                      <input type="number" min="0" placeholder="kg" value={ins.kg} onChange={function(e){ var arr=descForm.insumos.slice(); arr[i]={...arr[i],kg:e.target.value}; setDescForm(function(f){ return {...f,insumos:arr}; }); }} style={{...S.input,width:90}}/>
                      <button onClick={function(){ setDescForm(function(f){ return {...f,insumos:f.insumos.filter(function(_,j){ return j!==i; })}; }); }} style={{background:"transparent",border:"1px solid #3a2a2a",color:"#f87171",borderRadius:6,padding:"7px 10px",cursor:"pointer"}}>X</button>
                    </div>
                  );
                })}
              </div>
              <button onClick={guardarDescarga} style={{background:"#1a3a5a",color:"#60a5fa",border:"1px solid #2a5a8a",borderRadius:8,padding:"11px 0",cursor:"pointer",fontSize:14,fontWeight:700,width:"100%"}}>Registrar Descarga</button>
            </div>
          </div>
        )}

        {vista==="suplementacion"&&(
          <div style={{display:"grid",gap:18}}>
            <div style={S.card}>
              <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:16}}>Registrar Suplementacion a Campo</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div>
                  <label style={S.label}>Lote / Corral</label>
                  <select value={suplForm.loteId} onChange={function(e){ setSuplForm(function(f){ return {...f,loteId:e.target.value}; }); }} style={S.input}>
                    {CAMPOS.map(function(cp){
                      var cors=corrales.filter(function(c){ return c.campoId===cp.id||c.compartido; });
                      return <optgroup key={cp.id} label={cp.nombre}>{cors.map(function(c){ return <option key={cp.id+c.id} value={c.id}>{c.nombre}</option>; })}</optgroup>;
                    })}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Suplemento</label>
                  <select value={suplForm.suplemento} onChange={function(e){ setSuplForm(function(f){ return {...f,suplemento:e.target.value}; }); }} style={S.input}>{SUPLEMENTOS_CAMPO.map(function(s){ return <option key={s}>{s}</option>; })}</select>
                </div>
                <div><label style={S.label}>Fecha desde</label><input type="date" value={suplForm.fechaDesde} onChange={function(e){ setSuplForm(function(f){ return {...f,fechaDesde:e.target.value}; }); }} style={S.input}/></div>
                <div><label style={S.label}>Fecha hasta</label><input type="date" value={suplForm.fechaHasta} onChange={function(e){ setSuplForm(function(f){ return {...f,fechaHasta:e.target.value}; }); }} style={S.input}/></div>
                <div><label style={S.label}>Kg totales</label><input type="number" min="0" placeholder="0" value={suplForm.kgTotales} onChange={function(e){ setSuplForm(function(f){ return {...f,kgTotales:e.target.value}; }); }} style={S.input}/></div>
                <div><label style={S.label}>Cantidad de animales</label><input type="number" min="0" placeholder="0" value={suplForm.animales} onChange={function(e){ setSuplForm(function(f){ return {...f,animales:e.target.value}; }); }} style={S.input}/></div>
              </div>
              {suplForm.kgTotales&&suplForm.animales&&Number(suplForm.animales)>0&&(
                <div style={{background:"#1a2a1a",border:"1px solid #2a4a2a",borderRadius:8,padding:12,marginBottom:12,fontSize:13,color:"#a8e8a8"}}>
                  Promedio: {(Number(suplForm.kgTotales)/Number(suplForm.animales)/(diffDias(suplForm.fechaDesde,suplForm.fechaHasta)||1)).toFixed(2)} kg/animal/dia durante {diffDias(suplForm.fechaDesde,suplForm.fechaHasta)||1} dias
                </div>
              )}
              <textarea value={suplForm.observaciones} onChange={function(e){ setSuplForm(function(f){ return {...f,observaciones:e.target.value}; }); }} placeholder="Observaciones..." rows={2} style={{...S.input,resize:"vertical",marginBottom:12}}/>
              <button onClick={guardarSuplemento} style={{background:"#1a3a1a",color:"#4ade80",border:"1px solid #2a6a2a",borderRadius:8,padding:"11px 0",cursor:"pointer",fontSize:14,fontWeight:700,width:"100%"}}>Registrar Suplementacion</button>
            </div>
            <div style={S.card}>
              <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:14}}>Historial</div>
              {suplementos.length===0?<div style={{color:"#8a7e6a",textAlign:"center",padding:30}}>Sin registros</div>:
                suplementos.map(function(sp){
                  var lote=corrales.find(function(c){ return c.id===sp.loteId; });
                  var campo=CAMPOS.find(function(cp){ return cp.id===(lote?lote.campoId:""); });
                  return (
                    <div key={sp.id} style={{background:"#1a2a1a",border:"1px solid #2a4a2a",borderRadius:10,padding:"12px 16px",marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
                        <span style={{background:"#2a4a2a",color:"#4ade80",borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700}}>{sp.suplemento}</span>
                        <span style={{fontSize:12,color:"#6a8a8a"}}>{campo?campo.nombre:""} - {lote?lote.nombre:sp.loteId}</span>
                      </div>
                      <div style={{fontSize:12,color:"#8a7e6a",marginBottom:8}}>{fmtFecha(sp.fechaDesde)} - {fmtFecha(sp.fechaHasta)} ({sp.dias} dias)</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                        <div style={{textAlign:"center",background:"#0f1a0f",borderRadius:6,padding:8}}><div style={{fontSize:10,color:"#6a8a6a"}}>Kg totales</div><div style={{fontSize:15,fontWeight:700,color:"#4ade80"}}>{fmtNum(sp.kgTotales)}</div></div>
                        <div style={{textAlign:"center",background:"#0f1a0f",borderRadius:6,padding:8}}><div style={{fontSize:10,color:"#6a8a6a"}}>Animales</div><div style={{fontSize:15,fontWeight:700,color:"#a8e8a8"}}>{sp.animales}</div></div>
                        <div style={{textAlign:"center",background:"#0f1a0f",borderRadius:6,padding:8}}><div style={{fontSize:10,color:"#6a8a6a"}}>kg/animal/dia</div><div style={{fontSize:15,fontWeight:700,color:"#fbbf24"}}>{Number(sp.kgAnimalDia).toFixed(2)}</div></div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {vista==="historial"&&(
          <div>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <select value={filtroCorral} onChange={function(e){ setFiltroCorral(e.target.value); }} style={{...S.input,width:"auto",minWidth:140}}>
                <option value="todos">Todos los corrales</option>
                {corrales.map(function(c){ return <option key={c.id} value={c.id}>{c.nombre}</option>; })}
              </select>
              <select value={filtroTipo} onChange={function(e){ setFiltroTipo(e.target.value); }} style={{...S.input,width:"auto",minWidth:130}}>
                <option value="todos">Todos los tipos</option>
                {TIPOS_MOV.map(function(t){ return <option key={t.id} value={t.id}>{t.label}</option>; })}
              </select>
            </div>
            {movFiltrados.length===0?<div style={{textAlign:"center",color:"#8a7e6a",padding:60}}>Sin movimientos</div>:
              movFiltrados.map(function(m){
                return (
                  <div key={m.id} style={{...S.card,padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:5}}>
                        <Badge tipo={m.tipo}/>
                        <span style={{fontSize:12,color:"#8a7e6a"}}>{m.fecha}</span>
                        {m.campoPropietario&&corrales.find(function(c){ return c.id===m.corral&&c.compartido; })&&(
                          <span style={{background:"#1a2a4a",border:"1px solid #60a5fa55",color:"#60a5fa",borderRadius:4,padding:"2px 7px",fontSize:11,fontWeight:700}}>{CAMPOS.find(function(x){ return x.id===m.campoPropietario; })?CAMPOS.find(function(x){ return x.id===m.campoPropietario; }).nombre:""}</span>
                        )}
                      </div>
                      <div style={{fontSize:14,color:"#e8dcc8",fontWeight:600}}>{m.cantidad} x {m.categoria}</div>
                      <div style={{fontSize:12,color:"#6a7a8a",marginTop:2}}>{corralNombre(m.corral)}{(m.tipo==="mov_interno"||m.tipo==="traslado_campos")&&m.corralDestino?" -> "+corralNombre(m.corralDestino):""}{m.tipo==="traslado_externo"&&m.destinoExterno?" -> "+m.destinoExterno:""}</div>
                      {m.observaciones&&<div style={{fontSize:12,color:"#6a6a5a",marginTop:3,fontStyle:"italic"}}>{m.observaciones}</div>}
                    </div>
                    <button onClick={function(){ eliminarMovimiento(m.id); }} style={{background:"transparent",border:"1px solid #3a2a2a",color:"#f87171",borderRadius:6,padding:"4px 9px",cursor:"pointer",fontSize:12}}>X</button>
                  </div>
                );
              })
            }
          </div>
        )}

        {vista==="reporte"&&(
          <div style={S.card}>
            <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:16}}>Reporte Narrativo - {movFiltrados.length} registros</div>
            {movFiltrados.length===0?<div style={{color:"#8a7e6a",textAlign:"center",padding:40}}>Sin movimientos</div>:
              movFiltrados.map(function(m,i){
                var t=TIPOS_MOV.find(function(x){ return x.id===m.tipo; })||TIPOS_MOV[0];
                var cn=corralNombre;
                var txt="";
                if(m.tipo==="entrada") txt="El dia "+fmtFecha(m.fecha)+", ingresaron "+m.cantidad+" "+m.categoria+" al "+cn(m.corral)+".";
                else if(m.tipo==="salida") txt="El dia "+fmtFecha(m.fecha)+", salieron "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+".";
                else if(m.tipo==="mov_interno") txt="El dia "+fmtFecha(m.fecha)+", se movieron internamente "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+" al "+cn(m.corralDestino)+" (mismo campo).";
                else if(m.tipo==="traslado_campos") txt="El dia "+fmtFecha(m.fecha)+", se trasladaron "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+" al "+cn(m.corralDestino)+" (entre campos).";
                else if(m.tipo==="traslado_externo") txt="El dia "+fmtFecha(m.fecha)+", salieron "+m.cantidad+" "+m.categoria+" del "+cn(m.corral)+" hacia "+(m.destinoExterno||"destino externo")+".";
                else if(m.tipo==="paricion") txt="El dia "+fmtFecha(m.fecha)+", se registraron "+m.cantidad+" pariciones de "+m.categoria+" en el "+cn(m.corral)+".";
                else if(m.tipo==="muerte") txt="El dia "+fmtFecha(m.fecha)+", fallecieron "+m.cantidad+" "+m.categoria+" en el "+cn(m.corral)+".";
                else if(m.tipo==="cambio_categoria") txt="El dia "+fmtFecha(m.fecha)+", se cambiaron "+m.cantidad+" "+m.categoria+" a "+m.categoriaDestino+" en el "+cn(m.corral)+".";
                return (
                  <div key={m.id} style={{display:"flex",gap:12,alignItems:"flex-start",paddingBottom:14,marginBottom:14,borderBottom:i<movFiltrados.length-1?"1px solid #1e2233":"none"}}>
                    <div style={{minWidth:30,height:30,borderRadius:"50%",background:t.color+"22",border:"1px solid "+t.color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:t.color,flexShrink:0}}>{t.icon}</div>
                    <p style={{margin:0,fontSize:14,color:"#e8dcc8",lineHeight:1.6}}>{txt}</p>
                  </div>
                );
              })
            }
          </div>
        )}

        {vista==="lotes"&&(
          <div style={{display:"grid",gap:14}}>
            {historialLotes.length===0?<div style={{...S.card,textAlign:"center",color:"#8a7e6a",padding:50}}>Registra entradas para ver el historial.</div>:
              historialLotes.filter(function(l){ var c=corrales.find(function(x){ return x.id===l.corralId; }); return c&&(c.campoId===campoFiltro||c.compartido); }).map(function(lote){
                var pastura=lotesPastura[lote.corralId];
                var editando=loteSeleccionado===lote.corralId;
                var totalDemMS=0;
                Object.entries(lote.porCat).forEach(function(entry){ var cat=entry[0],cant=entry[1]; var consumo=CONSUMO_MS[cat]||8; totalDemMS+=cant*consumo*lote.dias; });
                var ofertaMS=null,balance=null,diasRacion=null;
                if(pastura&&pastura.hectareas&&pastura.rendimiento){ ofertaMS=Number(pastura.hectareas)*Number(pastura.rendimiento); balance=ofertaMS-totalDemMS; diasRacion=Math.round(ofertaMS/(totalDemMS/lote.dias||1)); }
                return (
                  <div key={lote.corralId} style={S.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:"#e8dcc8"}}>{lote.nombre}</div>
                        <div style={{fontSize:12,color:"#8a7e6a",marginTop:2}}>{fmtFecha(lote.fechaEntrada)} - {lote.fechaSalida===todayStr()?"Actualmente":fmtFecha(lote.fechaSalida)} <span style={{marginLeft:8,color:"#b5925a",fontWeight:700}}>{lote.dias} dias</span></div>
                      </div>
                      <button onClick={function(){ setLoteSeleccionado(editando?null:lote.corralId); if(!editando){ var p=lotesPastura[lote.corralId]; if(p) setPasturaForm(p); else setPasturaForm({pastura:PASTURAS_DEFAULT[0].nombre,hectareas:"",rendimiento:PASTURAS_DEFAULT[0].rendimiento}); } }} style={{background:"#1e2233",color:"#60a5fa",border:"1px solid #2a3a5e",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>{pastura?"Editar pastura":"+ Cargar pastura"}</button>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                      {Object.entries(lote.porCat).map(function(entry){ var cat=entry[0],cant=entry[1]; return <div key={cat} style={{background:"#1e2233",border:"1px solid #2a2f3e",borderRadius:6,padding:"4px 10px",fontSize:12}}><span style={{color:"#8a9ab0"}}>{cat}</span><span style={{color:"#e8dcc8",fontWeight:700,marginLeft:6}}>{cant}</span></div>; })}
                    </div>
                    {editando&&(
                      <div style={{background:"#1a1f2e",border:"1px solid #2a3048",borderRadius:10,padding:14,marginBottom:12}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                          <div><label style={S.label}>Pastura</label><select value={pasturaForm.pastura} onChange={function(e){ var p=PASTURAS_DEFAULT.find(function(x){ return x.nombre===e.target.value; }); setPasturaForm(function(f){ return {...f,pastura:e.target.value,rendimiento:p?p.rendimiento:f.rendimiento}; }); }} style={S.input}>{PASTURAS_DEFAULT.map(function(p){ return <option key={p.nombre}>{p.nombre}</option>; })}</select></div>
                          <div><label style={S.label}>Hectareas</label><input type="number" min="0" placeholder="ha" value={pasturaForm.hectareas} onChange={function(e){ setPasturaForm(function(f){ return {...f,hectareas:e.target.value}; }); }} style={S.input}/></div>
                          <div><label style={S.label}>kg MS/ha</label><input type="number" min="0" value={pasturaForm.rendimiento} onChange={function(e){ setPasturaForm(function(f){ return {...f,rendimiento:e.target.value}; }); }} style={S.input}/></div>
                        </div>
                        <button onClick={function(){ guardarPastura(lote.corralId); }} style={{marginTop:10,background:"#1e3a5a",color:"#60a5fa",border:"1px solid #2a5a8a",borderRadius:6,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700}}>Guardar</button>
                      </div>
                    )}
                    {pastura&&!editando&&ofertaMS!==null&&(
                      <div style={{background:"#161a24",border:"1px solid #2a2f3e",borderRadius:8,padding:12,fontSize:13,color:"#c8c8b0",lineHeight:1.7}}>
                        El lote <strong style={{color:"#e8dcc8"}}>{lote.nombre}</strong> con <strong style={{color:"#a8e8a8"}}>{pastura.hectareas} ha</strong> de <strong style={{color:"#a8e8a8"}}>{pastura.pastura}</strong> ofrecio <strong style={{color:"#fbbf24"}}>{fmtNum(ofertaMS)} kg MS</strong> - equivalente a <strong style={{color:"#fbbf24"}}>{diasRacion} raciones diarias</strong> para la carga registrada.
                        {balance<0&&<span style={{color:"#f87171"}}> Deficit de {fmtNum(Math.abs(balance))} kg MS.</span>}
                        {balance>=0&&<span style={{color:"#4ade80"}}> Sobrante de {fmtNum(balance)} kg MS.</span>}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        )}

        {vista==="stock"&&(
          <div>
            <div style={{...S.card,marginBottom:14}}>
              <div style={{fontSize:12,letterSpacing:2,color:"#8a7e6a",textTransform:"uppercase",marginBottom:14}}>Stock por Campo</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {CAMPOS.map(function(campo){
                  var tot={}; CATEGORIAS.forEach(function(c){ tot[c]=0; });
                  movimientos.forEach(function(m){
                    var corralObj=corrales.find(function(c){ return c.id===m.corral; });
                    var corralDestinoObj=corrales.find(function(c){ return c.id===m.corralDestino; });
                    // Para corrales compartidos, el campo propietario determina a quién pertenece
                    var campoCorral=corralObj&&corralObj.compartido?(m.campoPropietario||null):corralObj?corralObj.campoId:null;
                    var campoDestino=corralDestinoObj&&corralDestinoObj.compartido?(m.campoPropietario||null):corralDestinoObj?corralDestinoObj.campoId:null;
                    var esMiCampo=campoCorral===campo.id;
                    var esMiDestino=campoDestino===campo.id;
                    if(esMiCampo){
                      if(m.tipo==="entrada"||m.tipo==="paricion") tot[m.categoria]=(tot[m.categoria]||0)+Number(m.cantidad);
                      else if(m.tipo==="salida"||m.tipo==="muerte"||m.tipo==="traslado_externo") tot[m.categoria]=(tot[m.categoria]||0)-Number(m.cantidad);
                      else if(m.tipo==="mov_interno"||m.tipo==="traslado_campos") tot[m.categoria]=(tot[m.categoria]||0)-Number(m.cantidad);
                    }
                    if(esMiDestino&&(m.tipo==="mov_interno"||m.tipo==="traslado_campos")) tot[m.categoria]=(tot[m.categoria]||0)+Number(m.cantidad);
                  });
                  var cats=CATEGORIAS.filter(function(c){ return tot[c]>0; });
                  var total=cats.reduce(function(a,c){ return a+tot[c]; },0);
                  return (
                    <div key={campo.id} style={{background:"#1a1f2e",border:"1px solid #2a3048",borderRadius:10,padding:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:13,fontWeight:700,color:"#e8c87a"}}>{campo.nombre}</div><div style={{fontSize:12,color:"#b5925a",fontWeight:700}}>{total} animales</div></div>
                      {cats.length===0?<div style={{fontSize:12,color:"#4a4a4a"}}>Sin registros</div>:cats.map(function(cat){ return <div key={cat} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:"1px solid #1e2233"}}><span style={{color:"#8a9ab0"}}>{cat}</span><span style={{color:"#e8dcc8",fontWeight:700}}>{tot[cat]}</span></div>; })}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{display:"grid",gap:10}}>
              {corrales.filter(function(c){ return c.campoId===campoFiltro||c.compartido; }).map(function(c){
                var s=stock[c.id]||{};
                var cats=CATEGORIAS.filter(function(cat){ return s[cat]>0; });
                var total=cats.reduce(function(acc,cat){ return acc+s[cat]; },0);
                return (
                  <div key={c.id} style={S.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#e8dcc8"}}>{c.nombre}</div>
                      <div style={{fontSize:12,color:"#b5925a",fontWeight:700}}>{total}</div>
                    </div>
                    {cats.length===0?<div style={{fontSize:12,color:"#4a4a4a"}}>Sin hacienda</div>:
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {cats.map(function(cat){ return <div key={cat} style={{background:"#1e2233",border:"1px solid #2a2f3e",borderRadius:6,padding:"4px 10px",fontSize:12}}><span style={{color:"#8a9ab0"}}>{cat}</span><span style={{color:"#e8dcc8",fontWeight:700,marginLeft:6}}>{s[cat]}</span></div>; })}
                      </div>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
