create table
  public.mdn_doc (
    id bigint not null default nextval('mdn_doc_id_seq'::regclass),
    url text not null,
    slug text not null,
    title text not null,
    content text null,
    token_count integer null,
    embedding extensions.vector null,
    checksum text null,
    constraint mdn_doc_pkey primary key (id),
    constraint mdn_doc_url_key unique (url),
  ) tablespace pg_default;

create table
  public.mdn_doc_section (
    id bigint not null default nextval('mdn_doc_section_id_seq'::regclass),
    doc_id bigint not null,
    heading text null,
    content text null,
    token_count integer null,
    embedding public.vector null,
    constraint mdn_doc_section_pkey primary key (id),
    constraint mdn_doc_section_doc_id_fkey foreign key (doc_id) references mdn_doc (id) on delete cascade
  ) tablespace pg_default;

create table
  public.mdn_doc_macro (
    id bigserial,
    hash text null,
    title text not null,
    title_short text not null,
    mdn_url text not null,
    html text null,
    markdown text null,
    token_count integer null,
    embedding extensions.vector null,
    text_hash text null,
    constraint mdn_doc_macro_pkey primary key (id),
    constraint mdn_doc_macro_url_key unique (mdn_url)
  ) tablespace pg_default;
