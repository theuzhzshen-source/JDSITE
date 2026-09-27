(function(){
  const cfg = window.JD_CONFIG || {};

  const ready = Boolean(
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    window.supabase
  );

  window.JD_DB = {
    ready,
    client: ready
      ? window.supabase.createClient(
          cfg.SUPABASE_URL,
          cfg.SUPABASE_ANON_KEY
        )
      : null
  };
})();