// OS nº CIPM-002/100/25 — Tópicos e subtópicos de comunicação obrigatória
// Documento-resumo elaborado a partir da OS CIPM-002/100/25 para fins de consulta rápida;
// em caso de divergência, prevalece o texto original da Ordem de Serviço.

// Tópicos: [id, titulo]
const OS_TOPICOS = [
  ["3.1", "Ocorrências envolvendo integrantes da PMESP ou operadores de Segurança Pública"],
  ["3.2", "Ocorrências envolvendo criminalidade comum, criminalidade organizada ou sistema prisional"],
  ["3.3", "Ocorrências envolvendo manifestações públicas, invasões de propriedade em área rural ou urbana e outras com impacto na Ordem Pública"],
  ["3.4", "Ocorrências envolvendo autoridades e/ou personalidades públicas"],
  ["3.5", "Ocorrências de trânsito urbano ou rodoviário"],
  ["3.6", "Ocorrências de Defesa Civil"],
];

// Subtópicos: [codigo, topicoId, descricao]
// Tópico 3.4 não possui subdivisões (ver OS_TOPICO_SEM_SUBDIVISAO).
const OS_SUBTOPICOS = [
  ["3.1.1", "3.1", "morte de policial militar, policial civil, policial penal ou guarda municipal em serviço ou em folga"],
  ["3.1.2", "3.1", "prisão de policial militar, ações contra bases policial-militares, disparo acidental, tentativa de suicídio de policial militar, policial militar envolvido em violência doméstica, etc."],
  ["3.1.3", "3.1", "confrontos, com ou sem feridos/mortos, envolvendo policiais militares ou operadores de Segurança Pública em âmbito estadual, federal ou municipal, assim como ocorrências que envolvam disparos de arma de fogo efetuados por policiais/operadores ou contra eles"],
  ["3.1.4", "3.1", "ocorrências de natureza grave envolvendo Oficiais Superiores PM"],
  ["3.1.5", "3.1", "homicídio praticado por operadores de Segurança Pública em âmbito estadual, federal ou municipal"],
  ["3.1.6", "3.1", "ocorrências com utilização de arma de incapacitação neuromuscular, munição de impacto controlado ou dispersão de multidão com uso de granadas policiais"],
  ["3.1.7", "3.1", "ocorrências envolvendo alunos em curso de formação"],
  ["3.1.8", "3.1", "acidentes graves envolvendo viaturas, como tombamento ou capotamento"],
  ["3.1.9", "3.1", "ocorrências envolvendo autoridades ou familiares do 1º escalão dos Poderes Executivo Federal, Estadual ou Municipal, bem como Parlamentares Federais, Estaduais e Municipais e membros do Poder Judiciário e do Ministério Público das esferas federal e estadual"],

  ["3.2.1", "3.2", "homicídio múltiplo (consumado ou tentado)"],
  ["3.2.2", "3.2", "ocorrências de apreensão de drogas acima de 5 kg, do mesmo tipo de droga, ou apreensão de droga desconhecida"],
  ["3.2.3", "3.2", "ocorrências de apreensão de armas portáteis do tipo fuzil, metralhadora ou submetralhadora"],
  ["3.2.4", "3.2", "ocorrências com agressores ativos"],
  ["3.2.5", "3.2", "apreensões de objetos com potencial lesivo que possam comprometer a segurança escolar"],
  ["3.2.6", "3.2", "ocorrências envolvendo torcidas organizadas"],
  ["3.2.7", "3.2", "ocorrências com explosivos"],
  ["3.2.8", "3.2", "ocorrências que denotem a participação do crime organizado e/ou atuação típica de criminalidade ultraviolenta, como furto/roubo a instituições bancárias ou transporte de valores"],
  ["3.2.9", "3.2", "fuga ou tentativa de fuga de presos de estabelecimentos prisionais ou Distrito Policial (DP) e de adolescentes das unidades da Fundação Centro de Atendimento Socioeducativo ao Adolescente (CASA)"],
  ["3.2.10", "3.2", "tumultos ou rebeliões em estabelecimentos prisionais ou unidades da Fundação CASA"],
  ["3.2.11", "3.2", "ocorrências com reféns"],
  ["3.2.12", "3.2", "cumprimento de cautelas judiciais ou realização de Operações Policiais Militares de Combate às Organizações Criminosas (ORCrim)"],
  ["3.2.13", "3.2", "apoio à Força Integrada de Combate ao Crime Organizado (FICCO) e/ou ao Grupo de Atuação Especial de Combate ao Crime Organizado (GAECO)"],

  ["3.3.1", "3.3", "manifestações sociais trabalhistas, político-sociais ou culturais"],
  ["3.3.2", "3.3", "invasões de propriedade pública ou particular, em área rural ou urbana, com atuação de movimentos sociais, associações de bairro, bem como qualquer outra forma de articulação, seja individual como em grupo de pessoas, para fins de moradia ou reforma agrária"],
  ["3.3.3", "3.3", "reintegrações de posse, transmitindo os riscos correlatos ao cumprimento da demanda judicial, em relação às variáveis “probabilidade” e “impacto” à ordem pública"],

  ["3.5.1", "3.5", "eventos que provoquem interdições prolongadas de vias urbanas e rodovias importantes (queda de rede elétrica sobre a via, queda de passarela, veículo de carga preso sob viadutos, etc.)"],
  ["3.5.2", "3.5", "grandes incêndios, acidentes com produtos perigosos, ocorrências relacionadas às chuvas (deslizamento, desabamentos, alagamentos, enchentes), grandes acidentes, queda de aeronaves, acidentes com meios de transporte coletivo, queda de árvores, produtos perigosos"],

  ["3.6.1", "3.6", "ocorrências de grande reflexo institucional, em virtude de repercussão midiática ou com divulgação de vídeos/imagens que possam impactar na imagem da Instituição"],
];

// Nota exibida para tópicos sem subdivisões (ex.: 3.4)
const OS_TOPICO_SEM_SUBDIVISAO = {
  "3.4": "Tópico sem subdivisões — qualquer ocorrência envolvendo autoridades e/ou personalidades públicas deve ser comunicada imediatamente à SAC.",
};
