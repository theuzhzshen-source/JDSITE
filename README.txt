JANITOR DAYS — ROCK 3D / BANCO DE SUGESTÕES

ESTA VERSÃO CORRIGE:
- Integrantes aparecem uma única vez no hero.
- Setas trocam o integrante sem usar scroll.
- O scroll move apenas as camadas gráficas/textuais 3D.
- MANHÃ e TARDE são botões reais e obrigatórios.
- Cada envio faz INSERT: uma sugestão nova nunca substitui outra.
- O turno fica salvo junto com cada música no banco.
- O painel secreto do administrador separa TODAS / MANHÃ / TARDE.
- As páginas individuais dos 4 integrantes usam links separados.
- Imagens ausentes não mostram ícone quebrado: há placeholders provisórios.

BANCO DE DADOS — SUPABASE
1. Crie um projeto no Supabase.
2. Abra SQL Editor.
3. Execute supabase-schema.sql.
4. Crie o usuário do administrador em Authentication > Users.
5. No js/config.js, coloque a URL e a chave anon/publica do projeto.
6. NÃO coloque a service_role key no frontend.

COMO O ENVIO FUNCIONA
Cada clique em ENVIAR cria uma nova linha em public.suggestions.
A linha contém:
- shift = MORNING ou AFTERNOON
- song
- artist
- observation
- status
- created_at / updated_at

Portanto:
MANHÃ: música A, música B, música C...
TARDE: música X, música Y, música Z...
As listas ficam separadas pelo campo shift. Nada é sobrescrito.

ADMIN
A página não aparece no menu público.
Arquivo: controle-jd-2026.html
A segurança real vem do Supabase Auth + RLS; esconder a URL sozinho NÃO é segurança.

FOTOS DOS INTEGRANTES
Os arquivos atuais em images/band/ são placeholders visuais para não quebrar o layout.
Substitua por:
images/band/integrante-1.png
images/band/integrante-2.png
images/band/integrante-3.png
images/band/integrante-4.png

PÁGINAS
index.html                 site principal
sugira.html                formulário de sugestões
integrante-1.html          integrante 01
integrante-2.html          integrante 02
integrante-3.html          integrante 03
integrante-4.html          integrante 04
controle-jd-2026.html      painel administrativo secreto


FOTOS DOS INTEGRANTES
======================
Coloque as 4 fotos reais nestes caminhos, mantendo exatamente estes nomes:
images/band/integrante-1.png
images/band/integrante-2.png
images/band/integrante-3.png
images/band/integrante-4.png

As fotos podem ter fundo transparente (PNG), que é o formato ideal para o efeito de palco.
O site nao usa mais bonecos/imagens falsas: sem a foto real, aparece apenas um quadro discreto pedindo a foto.

CONTROLES
=========
As setas laterais ficam presas ao centro do seletor. O efeito de clique nao altera a posicao delas.
O botao SUGIRA UMA MUSICA foi escurecido para combinar com o tema rock/azul tempestade.

BANCO
=====
Cada envio cria uma nova linha na tabela suggestions. O turno MORNING/AFTERNOON fica salvo na propria linha; nenhuma sugestao substitui outra.


ADMINISTRADOR CONFIGURADO
=========================
E-mail do administrador: jadaybanda@gmail.com

O painel já deixa o e-mail preenchido no login e o RLS do Supabase está configurado
para autorizar somente esse e-mail. A senha NÃO é gravada no HTML/JavaScript:
ela deve ser criada no Supabase Authentication > Users para o usuário acima.

PAINEL ADMINISTRATIVO
=====================
controle-jd-2026.html mostra simultaneamente:
- todas as músicas do turno MANHÃ;
- todas as músicas do turno TARDE;
- quantidade por turno;
- pesquisa por música/artista;
- filtro por status;
- alteração de status;
- exclusão de sugestões.
