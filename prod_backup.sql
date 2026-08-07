--
-- PostgreSQL database dump
--

\restrict O3B9HY0Mo75JA6Cydhds5AZhDnniX4fWvUnsJiNCd5GfgsEvOL25wwiQyvVxuZz

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_responsable_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_principal_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_comisionista_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_id_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_persona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tramos_vuelo DROP CONSTRAINT IF EXISTS tramos_vuelo_prod_tiqueteria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tramos_vuelo DROP CONSTRAINT IF EXISTS tramos_vuelo_plan_equipaje_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tramos_vuelo DROP CONSTRAINT IF EXISTS tramos_vuelo_aeropuerto_origen_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tramos_vuelo DROP CONSTRAINT IF EXISTS tramos_vuelo_aeropuerto_destino_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tramos_vuelo DROP CONSTRAINT IF EXISTS tramos_vuelo_aerolinea_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tarjetas_agencia DROP CONSTRAINT IF EXISTS tarjetas_agencia_metodo_pago_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sesiones DROP CONSTRAINT IF EXISTS sesiones_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.responsables DROP CONSTRAINT IF EXISTS responsables_persona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_visas DROP CONSTRAINT IF EXISTS prod_visas_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_tours DROP CONSTRAINT IF EXISTS prod_tours_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_tiqueteria DROP CONSTRAINT IF EXISTS "prod_tiqueteria_planEquipajeId_fkey";
ALTER TABLE IF EXISTS ONLY public.prod_tiqueteria DROP CONSTRAINT IF EXISTS prod_tiqueteria_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_tiqueteria DROP CONSTRAINT IF EXISTS "prod_tiqueteria_aerolineaId_fkey";
ALTER TABLE IF EXISTS ONLY public.prod_simcards DROP CONSTRAINT IF EXISTS prod_simcards_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_seguros DROP CONSTRAINT IF EXISTS prod_seguros_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_restaurantes DROP CONSTRAINT IF EXISTS prod_restaurantes_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_planes DROP CONSTRAINT IF EXISTS prod_planes_paquete_tarifa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_planes DROP CONSTRAINT IF EXISTS "prod_planes_paqueteId_fkey";
ALTER TABLE IF EXISTS ONLY public.prod_planes DROP CONSTRAINT IF EXISTS prod_planes_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_planes DROP CONSTRAINT IF EXISTS "prod_planes_aerolineaId_fkey";
ALTER TABLE IF EXISTS ONLY public.prod_pasaportes DROP CONSTRAINT IF EXISTS prod_pasaportes_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_migracion DROP CONSTRAINT IF EXISTS prod_migracion_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_mascotas DROP CONSTRAINT IF EXISTS prod_mascotas_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_hoteleria DROP CONSTRAINT IF EXISTS prod_hoteleria_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_fincas DROP CONSTRAINT IF EXISTS prod_fincas_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_eventos DROP CONSTRAINT IF EXISTS prod_eventos_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_equipajes DROP CONSTRAINT IF EXISTS prod_equipajes_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_equipajes DROP CONSTRAINT IF EXISTS prod_equipajes_aerolinea_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_checkins DROP CONSTRAINT IF EXISTS prod_checkins_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.prod_autos DROP CONSTRAINT IF EXISTS prod_autos_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.politicas_equipaje DROP CONSTRAINT IF EXISTS politicas_equipaje_aerolinea_id_fkey;
ALTER TABLE IF EXISTS ONLY public.personas DROP CONSTRAINT IF EXISTS personas_tipo_documento_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permisos_usuario DROP CONSTRAINT IF EXISTS permisos_usuario_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permisos_usuario DROP CONSTRAINT IF EXISTS permisos_usuario_permiso_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_rol_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_permiso_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pasajeros_detalle DROP CONSTRAINT IF EXISTS pasajeros_detalle_persona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pasajeros_detalle DROP CONSTRAINT IF EXISTS pasajeros_detalle_detalle_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS paquetes_creado_por_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquete_vuelo DROP CONSTRAINT IF EXISTS paquete_vuelo_paquete_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquete_vuelo DROP CONSTRAINT IF EXISTS paquete_vuelo_aerolinea_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquete_tarifas DROP CONSTRAINT IF EXISTS paquete_tarifas_paquete_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquete_proveedor DROP CONSTRAINT IF EXISTS paquete_proveedor_proveedor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquete_proveedor DROP CONSTRAINT IF EXISTS paquete_proveedor_paquete_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquete_hotel DROP CONSTRAINT IF EXISTS paquete_hotel_paquete_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquete_asistencia_medica DROP CONSTRAINT IF EXISTS paquete_asistencia_medica_paquete_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pagos_venta DROP CONSTRAINT IF EXISTS pagos_venta_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pagos_venta DROP CONSTRAINT IF EXISTS pagos_venta_metodo_pago_id_fkey;
ALTER TABLE IF EXISTS ONLY public.logs_usuarios DROP CONSTRAINT IF EXISTS logs_usuarios_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.liquidaciones_comision DROP CONSTRAINT IF EXISTS liquidaciones_comision_metodo_pago_id_fkey;
ALTER TABLE IF EXISTS ONLY public.liquidaciones_comision DROP CONSTRAINT IF EXISTS liquidaciones_comision_comisionista_id_fkey;
ALTER TABLE IF EXISTS ONLY public.liquidacion_ventas DROP CONSTRAINT IF EXISTS liquidacion_ventas_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.liquidacion_ventas DROP CONSTRAINT IF EXISTS liquidacion_ventas_liquidacion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.detalle_venta DROP CONSTRAINT IF EXISTS detalle_venta_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.detalle_venta DROP CONSTRAINT IF EXISTS detalle_venta_proveedor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.detalle_venta DROP CONSTRAINT IF EXISTS detalle_venta_parent_detalle_id_fkey;
ALTER TABLE IF EXISTS ONLY public.detalle_venta DROP CONSTRAINT IF EXISTS detalle_venta_metodo_pago_proveedor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comisionistas DROP CONSTRAINT IF EXISTS comisionistas_persona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_persona_id_fkey;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_creado_por_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_credentials DROP CONSTRAINT IF EXISTS webauthn_credentials_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS protect_objects_delete ON storage.objects;
DROP TRIGGER IF EXISTS protect_buckets_delete ON storage.buckets;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP INDEX IF EXISTS storage.vector_indexes_name_bucket_id_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name_lower;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.buckets_analytics_unique_name_idx;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_action_filter_selec;
DROP INDEX IF EXISTS realtime.messages_inserted_at_topic_index;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.ventas_usuario_id_idx;
DROP INDEX IF EXISTS public.ventas_mensuales_year_month_key;
DROP INDEX IF EXISTS public.ventas_comisionista_id_idx;
DROP INDEX IF EXISTS public.ventas_cliente_id_idx;
DROP INDEX IF EXISTS public.usuarios_persona_id_key;
DROP INDEX IF EXISTS public.usuarios_email_key;
DROP INDEX IF EXISTS public.tramos_vuelo_prod_tiqueteria_id_idx;
DROP INDEX IF EXISTS public.tramos_vuelo_aeropuerto_origen_id_idx;
DROP INDEX IF EXISTS public.tramos_vuelo_aeropuerto_destino_id_idx;
DROP INDEX IF EXISTS public.tipos_documento_abreviatura_key;
DROP INDEX IF EXISTS public.roles_nombre_key;
DROP INDEX IF EXISTS public.responsables_persona_id_key;
DROP INDEX IF EXISTS public.prod_visas_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_tours_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_tiqueteria_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_simcards_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_seguros_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_restaurantes_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_planes_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_pasaportes_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_migracion_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_mascotas_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_hoteleria_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_fincas_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_eventos_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_equipajes_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_checkins_detalle_venta_id_key;
DROP INDEX IF EXISTS public.prod_autos_detalle_venta_id_key;
DROP INDEX IF EXISTS public.personas_documento_key;
DROP INDEX IF EXISTS public.permisos_usuario_usuario_id_permiso_id_key;
DROP INDEX IF EXISTS public.permisos_rol_rol_id_permiso_id_key;
DROP INDEX IF EXISTS public.pasajeros_detalle_persona_id_idx;
DROP INDEX IF EXISTS public.pasajeros_detalle_detalle_venta_id_idx;
DROP INDEX IF EXISTS public.paquete_asistencia_medica_paquete_id_key;
DROP INDEX IF EXISTS public.pagos_venta_venta_id_idx;
DROP INDEX IF EXISTS public.metodos_pago_nombre_key;
DROP INDEX IF EXISTS public.liquidacion_ventas_liquidacion_id_venta_id_key;
DROP INDEX IF EXISTS public.detalle_venta_venta_id_idx;
DROP INDEX IF EXISTS public.detalle_venta_proveedor_id_idx;
DROP INDEX IF EXISTS public.detalle_venta_metodo_pago_proveedor_id_idx;
DROP INDEX IF EXISTS public.comisionistas_persona_id_key;
DROP INDEX IF EXISTS public.clientes_persona_id_key;
DROP INDEX IF EXISTS public.aeropuertos_codigo_iata_key;
DROP INDEX IF EXISTS public.aerolineas_codigo_iata_key;
DROP INDEX IF EXISTS auth.webauthn_credentials_user_id_idx;
DROP INDEX IF EXISTS auth.webauthn_credentials_credential_id_key;
DROP INDEX IF EXISTS auth.webauthn_challenges_user_id_idx;
DROP INDEX IF EXISTS auth.webauthn_challenges_expires_at_idx;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_users_name;
DROP INDEX IF EXISTS auth.idx_users_last_sign_in_at_desc;
DROP INDEX IF EXISTS auth.idx_users_email;
DROP INDEX IF EXISTS auth.idx_users_created_at_desc;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_oauth_client_states_created_at;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_provider_type_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_identifier_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_enabled_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_created_at_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets_vectors DROP CONSTRAINT IF EXISTS buckets_vectors_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS realtime.messages DROP CONSTRAINT IF EXISTS messages_payload_exclusive;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_pkey;
ALTER TABLE IF EXISTS ONLY public.ventas_mensuales DROP CONSTRAINT IF EXISTS ventas_mensuales_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.tramos_vuelo DROP CONSTRAINT IF EXISTS tramos_vuelo_pkey;
ALTER TABLE IF EXISTS ONLY public.tipos_documento DROP CONSTRAINT IF EXISTS tipos_documento_pkey;
ALTER TABLE IF EXISTS ONLY public.tarjetas_agencia DROP CONSTRAINT IF EXISTS tarjetas_agencia_pkey;
ALTER TABLE IF EXISTS ONLY public.sesiones DROP CONSTRAINT IF EXISTS sesiones_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.responsables DROP CONSTRAINT IF EXISTS responsables_pkey;
ALTER TABLE IF EXISTS ONLY public.proveedores DROP CONSTRAINT IF EXISTS proveedores_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_visas DROP CONSTRAINT IF EXISTS prod_visas_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_tours DROP CONSTRAINT IF EXISTS prod_tours_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_tiqueteria DROP CONSTRAINT IF EXISTS prod_tiqueteria_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_simcards DROP CONSTRAINT IF EXISTS prod_simcards_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_seguros DROP CONSTRAINT IF EXISTS prod_seguros_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_restaurantes DROP CONSTRAINT IF EXISTS prod_restaurantes_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_planes DROP CONSTRAINT IF EXISTS prod_planes_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_pasaportes DROP CONSTRAINT IF EXISTS prod_pasaportes_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_migracion DROP CONSTRAINT IF EXISTS prod_migracion_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_mascotas DROP CONSTRAINT IF EXISTS prod_mascotas_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_hoteleria DROP CONSTRAINT IF EXISTS prod_hoteleria_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_fincas DROP CONSTRAINT IF EXISTS prod_fincas_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_eventos DROP CONSTRAINT IF EXISTS prod_eventos_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_equipajes DROP CONSTRAINT IF EXISTS prod_equipajes_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_checkins DROP CONSTRAINT IF EXISTS prod_checkins_pkey;
ALTER TABLE IF EXISTS ONLY public.prod_autos DROP CONSTRAINT IF EXISTS prod_autos_pkey;
ALTER TABLE IF EXISTS ONLY public.politicas_equipaje DROP CONSTRAINT IF EXISTS politicas_equipaje_pkey;
ALTER TABLE IF EXISTS ONLY public.personas DROP CONSTRAINT IF EXISTS personas_pkey;
ALTER TABLE IF EXISTS ONLY public.permisos_usuario DROP CONSTRAINT IF EXISTS permisos_usuario_pkey;
ALTER TABLE IF EXISTS ONLY public.permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_pkey;
ALTER TABLE IF EXISTS ONLY public.permisos DROP CONSTRAINT IF EXISTS permisos_pkey;
ALTER TABLE IF EXISTS ONLY public.pasajeros_detalle DROP CONSTRAINT IF EXISTS pasajeros_detalle_pkey;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS paquetes_pkey;
ALTER TABLE IF EXISTS ONLY public.paquete_vuelo DROP CONSTRAINT IF EXISTS paquete_vuelo_pkey;
ALTER TABLE IF EXISTS ONLY public.paquete_tarifas DROP CONSTRAINT IF EXISTS paquete_tarifas_pkey;
ALTER TABLE IF EXISTS ONLY public.paquete_proveedor DROP CONSTRAINT IF EXISTS paquete_proveedor_pkey;
ALTER TABLE IF EXISTS ONLY public.paquete_hotel DROP CONSTRAINT IF EXISTS paquete_hotel_pkey;
ALTER TABLE IF EXISTS ONLY public.paquete_asistencia_medica DROP CONSTRAINT IF EXISTS paquete_asistencia_medica_pkey;
ALTER TABLE IF EXISTS ONLY public.pagos_venta DROP CONSTRAINT IF EXISTS pagos_venta_pkey;
ALTER TABLE IF EXISTS ONLY public.metodos_pago DROP CONSTRAINT IF EXISTS metodos_pago_pkey;
ALTER TABLE IF EXISTS ONLY public.logs_usuarios DROP CONSTRAINT IF EXISTS logs_usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.liquidaciones_comision DROP CONSTRAINT IF EXISTS liquidaciones_comision_pkey;
ALTER TABLE IF EXISTS ONLY public.liquidacion_ventas DROP CONSTRAINT IF EXISTS liquidacion_ventas_pkey;
ALTER TABLE IF EXISTS ONLY public.detalle_venta DROP CONSTRAINT IF EXISTS detalle_venta_pkey;
ALTER TABLE IF EXISTS ONLY public.comisionistas DROP CONSTRAINT IF EXISTS comisionistas_pkey;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_pkey;
ALTER TABLE IF EXISTS ONLY public.aeropuertos DROP CONSTRAINT IF EXISTS aeropuertos_pkey;
ALTER TABLE IF EXISTS ONLY public.aerolineas DROP CONSTRAINT IF EXISTS aerolineas_pkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_credentials DROP CONSTRAINT IF EXISTS webauthn_credentials_pkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_client_states DROP CONSTRAINT IF EXISTS oauth_client_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_identifier_key;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS public.ventas_mensuales ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ventas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipos_documento ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tarjetas_agencia ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.responsables ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.proveedores ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.politicas_equipaje ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.personas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permisos_usuario ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permisos_rol ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permisos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquetes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquete_vuelo ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquete_tarifas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquete_proveedor ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquete_hotel ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquete_asistencia_medica ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.metodos_pago ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.logs_usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.liquidaciones_comision ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.liquidacion_ventas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comisionistas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clientes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.aeropuertos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.aerolineas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS storage.vector_indexes;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets_vectors;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages;
DROP SEQUENCE IF EXISTS public.ventas_mensuales_id_seq;
DROP TABLE IF EXISTS public.ventas_mensuales;
DROP SEQUENCE IF EXISTS public.ventas_id_seq;
DROP TABLE IF EXISTS public.ventas;
DROP SEQUENCE IF EXISTS public.usuarios_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP TABLE IF EXISTS public.tramos_vuelo;
DROP SEQUENCE IF EXISTS public.tipos_documento_id_seq;
DROP TABLE IF EXISTS public.tipos_documento;
DROP SEQUENCE IF EXISTS public.tarjetas_agencia_id_seq;
DROP TABLE IF EXISTS public.tarjetas_agencia;
DROP TABLE IF EXISTS public.sesiones;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.responsables_id_seq;
DROP TABLE IF EXISTS public.responsables;
DROP SEQUENCE IF EXISTS public.proveedores_id_seq;
DROP TABLE IF EXISTS public.proveedores;
DROP TABLE IF EXISTS public.prod_visas;
DROP TABLE IF EXISTS public.prod_tours;
DROP TABLE IF EXISTS public.prod_tiqueteria;
DROP TABLE IF EXISTS public.prod_simcards;
DROP TABLE IF EXISTS public.prod_seguros;
DROP TABLE IF EXISTS public.prod_restaurantes;
DROP TABLE IF EXISTS public.prod_planes;
DROP TABLE IF EXISTS public.prod_pasaportes;
DROP TABLE IF EXISTS public.prod_migracion;
DROP TABLE IF EXISTS public.prod_mascotas;
DROP TABLE IF EXISTS public.prod_hoteleria;
DROP TABLE IF EXISTS public.prod_fincas;
DROP TABLE IF EXISTS public.prod_eventos;
DROP TABLE IF EXISTS public.prod_equipajes;
DROP TABLE IF EXISTS public.prod_checkins;
DROP TABLE IF EXISTS public.prod_autos;
DROP SEQUENCE IF EXISTS public.politicas_equipaje_id_seq;
DROP TABLE IF EXISTS public.politicas_equipaje;
DROP SEQUENCE IF EXISTS public.personas_id_seq;
DROP TABLE IF EXISTS public.personas;
DROP SEQUENCE IF EXISTS public.permisos_usuario_id_seq;
DROP TABLE IF EXISTS public.permisos_usuario;
DROP SEQUENCE IF EXISTS public.permisos_rol_id_seq;
DROP TABLE IF EXISTS public.permisos_rol;
DROP SEQUENCE IF EXISTS public.permisos_id_seq;
DROP TABLE IF EXISTS public.permisos;
DROP TABLE IF EXISTS public.pasajeros_detalle;
DROP SEQUENCE IF EXISTS public.paquetes_id_seq;
DROP TABLE IF EXISTS public.paquetes;
DROP SEQUENCE IF EXISTS public.paquete_vuelo_id_seq;
DROP TABLE IF EXISTS public.paquete_vuelo;
DROP SEQUENCE IF EXISTS public.paquete_tarifas_id_seq;
DROP TABLE IF EXISTS public.paquete_tarifas;
DROP SEQUENCE IF EXISTS public.paquete_proveedor_id_seq;
DROP TABLE IF EXISTS public.paquete_proveedor;
DROP SEQUENCE IF EXISTS public.paquete_hotel_id_seq;
DROP TABLE IF EXISTS public.paquete_hotel;
DROP SEQUENCE IF EXISTS public.paquete_asistencia_medica_id_seq;
DROP TABLE IF EXISTS public.paquete_asistencia_medica;
DROP TABLE IF EXISTS public.pagos_venta;
DROP SEQUENCE IF EXISTS public.metodos_pago_id_seq;
DROP TABLE IF EXISTS public.metodos_pago;
DROP SEQUENCE IF EXISTS public.logs_usuarios_id_seq;
DROP TABLE IF EXISTS public.logs_usuarios;
DROP SEQUENCE IF EXISTS public.liquidaciones_comision_id_seq;
DROP TABLE IF EXISTS public.liquidaciones_comision;
DROP SEQUENCE IF EXISTS public.liquidacion_ventas_id_seq;
DROP TABLE IF EXISTS public.liquidacion_ventas;
DROP TABLE IF EXISTS public.detalle_venta;
DROP SEQUENCE IF EXISTS public.comisionistas_id_seq;
DROP TABLE IF EXISTS public.comisionistas;
DROP SEQUENCE IF EXISTS public.clientes_id_seq;
DROP TABLE IF EXISTS public.clientes;
DROP SEQUENCE IF EXISTS public.aeropuertos_id_seq;
DROP TABLE IF EXISTS public.aeropuertos;
DROP SEQUENCE IF EXISTS public.aerolineas_id_seq;
DROP TABLE IF EXISTS public.aerolineas;
DROP TABLE IF EXISTS auth.webauthn_credentials;
DROP TABLE IF EXISTS auth.webauthn_challenges;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_client_states;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.custom_oauth_providers;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION IF EXISTS storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.protect_delete();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.allow_only_operation(expected_operation text);
DROP FUNCTION IF EXISTS storage.allow_any_operation(expected_operations text[]);
DROP FUNCTION IF EXISTS realtime.wal2json_escape_identifier(name text);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send_binary(payload bytea, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS public."UserStatus";
DROP TYPE IF EXISTS public."TipoHotel";
DROP TYPE IF EXISTS public."TamanoMascota";
DROP TYPE IF EXISTS public."SaleStatus";
DROP TYPE IF EXISTS public."RegimenAlimenticio";
DROP TYPE IF EXISTS public."FlightMode";
DROP TYPE IF EXISTS public."EstadoPaquete";
DROP TYPE IF EXISTS public."Cobertura";
DROP TYPE IF EXISTS public."CheckinStatus";
DROP TYPE IF EXISTS public."AgentStatus";
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
-- *not* dropping schema, since initdb creates it
DROP SCHEMA IF EXISTS pgbouncer;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: AgentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AgentStatus" AS ENUM (
    'Activo',
    'Inactivo'
);


--
-- Name: CheckinStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CheckinStatus" AS ENUM (
    'pendiente',
    'realizado',
    'critico'
);


--
-- Name: Cobertura; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Cobertura" AS ENUM (
    'Nacional',
    'Internacional',
    'Ambos'
);


--
-- Name: EstadoPaquete; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EstadoPaquete" AS ENUM (
    'activo',
    'inactivo',
    'agotado'
);


--
-- Name: FlightMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FlightMode" AS ENUM (
    'one_way',
    'round_trip'
);


--
-- Name: RegimenAlimenticio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RegimenAlimenticio" AS ENUM (
    'solo_desayuno',
    'media_pension',
    'todo_incluido',
    'full',
    'sin_alimentacion'
);


--
-- Name: SaleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SaleStatus" AS ENUM (
    'credito',
    'abonado',
    'pagado',
    'anulado'
);


--
-- Name: TamanoMascota; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TamanoMascota" AS ENUM (
    'pequeno',
    'mediano',
    'grande',
    'gigante'
);


--
-- Name: TipoHotel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoHotel" AS ENUM (
    'hotel',
    'resort',
    'boutique',
    'apartamento',
    'hostal',
    'fincas'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'active',
    'inactive'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: aerolineas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aerolineas (
    id integer NOT NULL,
    nombre text NOT NULL,
    codigo_iata text,
    tipo public."Cobertura" DEFAULT 'Internacional'::public."Cobertura" NOT NULL,
    web text
);


--
-- Name: aerolineas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.aerolineas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aerolineas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.aerolineas_id_seq OWNED BY public.aerolineas.id;


--
-- Name: aeropuertos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aeropuertos (
    id integer NOT NULL,
    nombre text NOT NULL,
    codigo_iata text NOT NULL,
    ciudad text,
    pais text,
    tipo public."Cobertura" DEFAULT 'Ambos'::public."Cobertura" NOT NULL,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL
);


--
-- Name: aeropuertos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.aeropuertos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aeropuertos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.aeropuertos_id_seq OWNED BY public.aeropuertos.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    persona_id integer NOT NULL,
    creado_por_id integer,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: comisionistas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comisionistas (
    id integer NOT NULL,
    persona_id integer NOT NULL,
    tipo text,
    umbral_pago double precision DEFAULT 0,
    acumulado double precision DEFAULT 0,
    status public."AgentStatus" DEFAULT 'Activo'::public."AgentStatus" NOT NULL,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    observacion character varying(300)
);


--
-- Name: comisionistas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comisionistas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comisionistas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comisionistas_id_seq OWNED BY public.comisionistas.id;


--
-- Name: detalle_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_venta (
    id text NOT NULL,
    venta_id integer NOT NULL,
    categoria text NOT NULL,
    nombre_servicio text,
    subtotal double precision DEFAULT 0,
    ta double precision DEFAULT 0,
    costo_proveedor double precision DEFAULT 0,
    proveedor_id integer,
    metodo_pago_proveedor_id integer,
    voucher_url text,
    fecha_inicio_viaje timestamp(3) without time zone,
    fecha_fin_viaje timestamp(3) without time zone,
    origen text,
    destino text,
    observaciones text,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    ta_cre double precision DEFAULT 0,
    parent_detalle_id text
);


--
-- Name: liquidacion_ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.liquidacion_ventas (
    id integer NOT NULL,
    liquidacion_id integer NOT NULL,
    venta_id integer NOT NULL
);


--
-- Name: liquidacion_ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.liquidacion_ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: liquidacion_ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.liquidacion_ventas_id_seq OWNED BY public.liquidacion_ventas.id;


--
-- Name: liquidaciones_comision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.liquidaciones_comision (
    id integer NOT NULL,
    comisionista_id integer NOT NULL,
    fecha timestamp(3) without time zone NOT NULL,
    monto double precision NOT NULL,
    metodo_pago_id integer,
    referencia text,
    notas text,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: liquidaciones_comision_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.liquidaciones_comision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: liquidaciones_comision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.liquidaciones_comision_id_seq OWNED BY public.liquidaciones_comision.id;


--
-- Name: logs_usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logs_usuarios (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    accion text,
    modulo text,
    descripcion text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: logs_usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.logs_usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs_usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logs_usuarios_id_seq OWNED BY public.logs_usuarios.id;


--
-- Name: metodos_pago; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metodos_pago (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: metodos_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.metodos_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: metodos_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.metodos_pago_id_seq OWNED BY public.metodos_pago.id;


--
-- Name: pagos_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagos_venta (
    id text NOT NULL,
    venta_id integer NOT NULL,
    monto double precision NOT NULL,
    metodo_pago_id integer,
    referencia text,
    fecha_pago timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: paquete_asistencia_medica; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paquete_asistencia_medica (
    id integer NOT NULL,
    paquete_id integer NOT NULL,
    cobertura_usd double precision DEFAULT 0 NOT NULL,
    dias_cobertura integer DEFAULT 0 NOT NULL
);


--
-- Name: paquete_asistencia_medica_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paquete_asistencia_medica_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paquete_asistencia_medica_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paquete_asistencia_medica_id_seq OWNED BY public.paquete_asistencia_medica.id;


--
-- Name: paquete_hotel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paquete_hotel (
    id integer NOT NULL,
    paquete_id integer NOT NULL,
    hotel_nombre text NOT NULL,
    tipo_hotel public."TipoHotel" DEFAULT 'hotel'::public."TipoHotel",
    regimen public."RegimenAlimenticio" DEFAULT 'full'::public."RegimenAlimenticio",
    noches integer
);


--
-- Name: paquete_hotel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paquete_hotel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paquete_hotel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paquete_hotel_id_seq OWNED BY public.paquete_hotel.id;


--
-- Name: paquete_proveedor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paquete_proveedor (
    id integer NOT NULL,
    paquete_id integer NOT NULL,
    proveedor_id integer NOT NULL
);


--
-- Name: paquete_proveedor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paquete_proveedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paquete_proveedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paquete_proveedor_id_seq OWNED BY public.paquete_proveedor.id;


--
-- Name: paquete_tarifas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paquete_tarifas (
    id integer NOT NULL,
    paquete_id integer NOT NULL,
    tarifa_adulto double precision DEFAULT 0 NOT NULL,
    tarifa_menor double precision,
    vigencia_desde timestamp(3) without time zone,
    vigencia_hasta timestamp(3) without time zone
);


--
-- Name: paquete_tarifas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paquete_tarifas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paquete_tarifas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paquete_tarifas_id_seq OWNED BY public.paquete_tarifas.id;


--
-- Name: paquete_vuelo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paquete_vuelo (
    id integer NOT NULL,
    paquete_id integer NOT NULL,
    aerolinea_id integer,
    nro_vuelo text,
    modo_vuelo public."FlightMode" DEFAULT 'round_trip'::public."FlightMode",
    plan_equipaje text,
    trayectos jsonb,
    tipo_transporte text DEFAULT 'Aéreo'::text
);


--
-- Name: paquete_vuelo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paquete_vuelo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paquete_vuelo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paquete_vuelo_id_seq OWNED BY public.paquete_vuelo.id;


--
-- Name: paquetes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paquetes (
    id integer NOT NULL,
    nombre text NOT NULL,
    destino text NOT NULL,
    servicios_incluidos text,
    no_incluido text,
    status public."EstadoPaquete" DEFAULT 'activo'::public."EstadoPaquete" NOT NULL,
    creado_por_id integer,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: paquetes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paquetes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paquetes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paquetes_id_seq OWNED BY public.paquetes.id;


--
-- Name: pasajeros_detalle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pasajeros_detalle (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    persona_id integer NOT NULL,
    es_titular boolean DEFAULT false,
    asiento text,
    nota text,
    nro_reserva text,
    nro_tiquete text
);


--
-- Name: permisos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permisos (
    id integer NOT NULL,
    modulo text NOT NULL,
    accion text NOT NULL,
    descripcion text
);


--
-- Name: permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permisos_id_seq OWNED BY public.permisos.id;


--
-- Name: permisos_rol; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permisos_rol (
    id integer NOT NULL,
    rol_id integer NOT NULL,
    permiso_id integer NOT NULL,
    valor text DEFAULT 'true'::text NOT NULL
);


--
-- Name: permisos_rol_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permisos_rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permisos_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permisos_rol_id_seq OWNED BY public.permisos_rol.id;


--
-- Name: permisos_usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permisos_usuario (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    permiso_id integer NOT NULL,
    permitido boolean DEFAULT true NOT NULL,
    valor text DEFAULT 'true'::text NOT NULL
);


--
-- Name: permisos_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permisos_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permisos_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permisos_usuario_id_seq OWNED BY public.permisos_usuario.id;


--
-- Name: personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personas (
    id integer NOT NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    tipo_documento_id integer,
    documento text,
    email text,
    telefono text,
    birth_date timestamp(3) without time zone,
    nacionalidad text,
    avatar_url text,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


--
-- Name: personas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personas_id_seq OWNED BY public.personas.id;


--
-- Name: politicas_equipaje; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.politicas_equipaje (
    id integer NOT NULL,
    aerolinea_id integer NOT NULL,
    tipo_tarifa text NOT NULL,
    articulo_personal text,
    equipaje_mano text,
    equipaje_bodega text,
    notas text
);


--
-- Name: politicas_equipaje_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.politicas_equipaje_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: politicas_equipaje_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.politicas_equipaje_id_seq OWNED BY public.politicas_equipaje.id;


--
-- Name: prod_autos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_autos (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    conductor_nombre text,
    licencia_nro text,
    fecha_recogida timestamp(3) without time zone,
    fecha_devolucion timestamp(3) without time zone,
    lugar_recogida text,
    categoria_auto text,
    conductores_adicionales integer DEFAULT 0,
    tarjeta_garantia_info text,
    tipo_seguro text
);


--
-- Name: prod_checkins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_checkins (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    nro_vuelo_reserva text,
    fecha_viaje timestamp(3) without time zone,
    asiento text,
    maletas_contadas text,
    telefono_contacto text,
    necesidades_especiales text,
    usa_silla_ruedas boolean DEFAULT false
);


--
-- Name: prod_equipajes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_equipajes (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    aerolinea_id integer,
    nro_reserva text,
    pasajero_nombre text,
    tipo_tarifa text,
    articulo_personal text,
    equipaje_mano text,
    equipaje_bodega text,
    observaciones text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: prod_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_eventos (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    organizacion text,
    nombre_contacto text,
    email_contacto text,
    "fechaInicio" timestamp(3) without time zone,
    "fechaFin" timestamp(3) without time zone,
    asistencia_estimada integer,
    espacio_requerido text,
    tipo_evento text,
    equipos_av text,
    requiere_catering boolean DEFAULT false,
    notas_catering text,
    ciudad character varying(40),
    direccion character varying(40),
    nombre_lugar character varying(40)
);


--
-- Name: prod_fincas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_fincas (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    responsable_nombre text,
    documento_responsable text,
    fecha_entrada timestamp(3) without time zone,
    fecha_salida timestamp(3) without time zone,
    adultos_count integer,
    ninos_count integer,
    tiene_mascotas boolean DEFAULT false,
    tipo_mascota text,
    servicios_extra text,
    ciudad_pueblo text,
    direccion_finca text,
    nombre_finca text,
    observaciones text
);


--
-- Name: prod_hoteleria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_hoteleria (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    hotel_nombre text,
    tipo_hotel public."TipoHotel" DEFAULT 'hotel'::public."TipoHotel",
    destino text,
    nro_reserva text,
    fecha_entrada timestamp(3) without time zone,
    fecha_salida timestamp(3) without time zone,
    observaciones text
);


--
-- Name: prod_mascotas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_mascotas (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    mascota_nombre text,
    especie text,
    raza text,
    peso_kg double precision,
    "tamanoMascota" public."TamanoMascota",
    transporte_tipo text,
    fecha_viaje timestamp(3) without time zone,
    pais_destino text,
    condiciones_medicas text,
    telefono_contacto text,
    empresa_transporte text,
    observaciones text
);


--
-- Name: prod_migracion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_migracion (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    tipo_tramite_migratorio text,
    nacionalidad text,
    pasaporte_nro text,
    pasaporte_vence timestamp(3) without time zone,
    pais_destino text,
    tipo_documento text DEFAULT 'Pasaporte'::text
);


--
-- Name: prod_pasaportes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_pasaportes (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    nombre_completo text,
    nro_documento text,
    fecha_nacimiento timestamp(3) without time zone,
    ciudad_residencia text,
    tipo_tramite text,
    fecha_estimada_viaje timestamp(3) without time zone,
    telefono_contacto text
);


--
-- Name: prod_planes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_planes (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    "paqueteId" integer,
    paquete_tarifa_id integer,
    nombre_plan text,
    "aerolineaId" integer,
    nro_reserva text,
    nro_tiquete text,
    fecha_viaje_inicio timestamp(3) without time zone,
    fecha_viaje_fin timestamp(3) without time zone,
    fecha_salida_vuelo timestamp(3) without time zone,
    fecha_regreso_vuelo timestamp(3) without time zone,
    adultos_count integer,
    menores_count integer,
    numero_confirmacion text,
    observaciones text,
    fecha_llegada_regreso_vuelo timestamp(3) without time zone,
    fecha_llegada_vuelo timestamp(3) without time zone,
    nombre_hotel text,
    nro_vuelo text,
    checkin_status_ida public."CheckinStatus" DEFAULT 'pendiente'::public."CheckinStatus",
    checkin_status_regreso public."CheckinStatus" DEFAULT 'pendiente'::public."CheckinStatus",
    tipo_paquete text DEFAULT 'own'::text,
    tipo_transporte text DEFAULT 'Aéreo'::text
);


--
-- Name: prod_restaurantes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_restaurantes (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    nombre_reserva text,
    fecha_hora_reserva timestamp(3) without time zone,
    personas_count integer,
    preferencia_mesa text,
    tipo_menu text,
    restricciones_dieta text,
    ocasion_especial text,
    telefono_contacto text
);


--
-- Name: prod_seguros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_seguros (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    cobertura_usd double precision DEFAULT 0,
    dias_cobertura integer DEFAULT 0,
    fecha_inicio_vigencia timestamp(3) without time zone,
    fecha_fin_vigencia timestamp(3) without time zone,
    telefono_contacto text,
    tipo_seguro text
);


--
-- Name: prod_simcards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_simcards (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    pais_destino text,
    fecha_llegada timestamp(3) without time zone,
    duracion_viaje text,
    plan_datos text,
    tipo_sim text,
    metodo_entrega text
);


--
-- Name: prod_tiqueteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_tiqueteria (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    "aerolineaId" integer,
    nro_reserva text,
    nro_vuelo text,
    nro_tiquete text,
    modo_vuelo public."FlightMode" DEFAULT 'one_way'::public."FlightMode",
    "planEquipajeId" integer,
    checkin_status public."CheckinStatus" DEFAULT 'pendiente'::public."CheckinStatus"
);


--
-- Name: prod_tours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_tours (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    tour_nombre text,
    fecha_preferida timestamp(3) without time zone,
    adultos_count integer DEFAULT 1,
    menores_count integer DEFAULT 0,
    edades_menores text,
    idioma_guia text,
    requiere_transporte boolean DEFAULT false,
    punto_encuentro text,
    condiciones_medicas text,
    telefono_contacto text,
    observaciones text
);


--
-- Name: prod_visas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prod_visas (
    id text NOT NULL,
    detalle_venta_id text NOT NULL,
    nombre_completo text,
    fecha_nacimiento timestamp(3) without time zone,
    nacionalidad text,
    nro_pasaporte text,
    vencimiento_pasaporte timestamp(3) without time zone,
    pais_aplicacion text,
    tipo_visa text,
    fecha_estimada_viaje timestamp(3) without time zone,
    email_contacto text,
    tipo_documento text DEFAULT 'Pasaporte'::text
);


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    nombre text NOT NULL,
    tipo text,
    email_contacto text,
    telefono text,
    web text,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    observaciones text
);


--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- Name: responsables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.responsables (
    id integer NOT NULL,
    persona_id integer NOT NULL,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone
);


--
-- Name: responsables_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.responsables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: responsables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.responsables_id_seq OWNED BY public.responsables.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sesiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesiones (
    id text NOT NULL,
    usuario_id integer NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_agent text
);


--
-- Name: tarjetas_agencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tarjetas_agencia (
    id integer NOT NULL,
    nombre text NOT NULL,
    metodo_pago_id integer,
    ultimos_cuatro text,
    descripcion text,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tarjetas_agencia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tarjetas_agencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tarjetas_agencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tarjetas_agencia_id_seq OWNED BY public.tarjetas_agencia.id;


--
-- Name: tipos_documento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_documento (
    id integer NOT NULL,
    nombre text NOT NULL,
    abreviatura text NOT NULL
);


--
-- Name: tipos_documento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_documento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipos_documento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_documento_id_seq OWNED BY public.tipos_documento.id;


--
-- Name: tramos_vuelo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tramos_vuelo (
    id text NOT NULL,
    prod_tiqueteria_id text NOT NULL,
    aeropuerto_origen_id integer NOT NULL,
    aeropuerto_destino_id integer NOT NULL,
    salida timestamp(3) without time zone NOT NULL,
    llegada timestamp(3) without time zone NOT NULL,
    nro_vuelo_tramo text,
    orden integer DEFAULT 1 NOT NULL,
    asiento text,
    checkin_status public."CheckinStatus" DEFAULT 'pendiente'::public."CheckinStatus",
    nro_tiquete text,
    aerolinea_id integer,
    plan_equipaje_id integer
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    persona_id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    rol_id integer NOT NULL,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    ultimo_login timestamp(3) without time zone,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    usuario_id integer NOT NULL,
    monto_total double precision DEFAULT 0 NOT NULL,
    costo_proveedor_total double precision DEFAULT 0,
    ta_total double precision DEFAULT 0,
    comisionista_id integer,
    monto_comision_bruto double precision DEFAULT 0,
    porcentaje_retencion_comision double precision DEFAULT 0,
    monto_comision_neto double precision DEFAULT 0,
    comision_liquidada boolean DEFAULT false,
    metodo_pago_principal_id integer,
    status public."SaleStatus" DEFAULT 'credito'::public."SaleStatus" NOT NULL,
    es_credito boolean DEFAULT false,
    fecha_vence_credito timestamp(3) without time zone,
    monto_pagado_credito double precision DEFAULT 0,
    observaciones text,
    creado_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    is_reviewed boolean DEFAULT false,
    responsable_id integer,
    ta_cre_total double precision DEFAULT 0
);


--
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventas_id_seq OWNED BY public.ventas.id;


--
-- Name: ventas_mensuales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas_mensuales (
    id integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    total double precision NOT NULL,
    count integer NOT NULL,
    hoteles double precision,
    vuelos double precision,
    paquetes double precision,
    seguros double precision,
    transferencias double precision
);


--
-- Name: ventas_mensuales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventas_mensuales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_mensuales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventas_mensuales_id_seq OWNED BY public.ventas_mensuales.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: aerolineas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aerolineas ALTER COLUMN id SET DEFAULT nextval('public.aerolineas_id_seq'::regclass);


--
-- Name: aeropuertos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aeropuertos ALTER COLUMN id SET DEFAULT nextval('public.aeropuertos_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: comisionistas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comisionistas ALTER COLUMN id SET DEFAULT nextval('public.comisionistas_id_seq'::regclass);


--
-- Name: liquidacion_ventas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion_ventas ALTER COLUMN id SET DEFAULT nextval('public.liquidacion_ventas_id_seq'::regclass);


--
-- Name: liquidaciones_comision id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidaciones_comision ALTER COLUMN id SET DEFAULT nextval('public.liquidaciones_comision_id_seq'::regclass);


--
-- Name: logs_usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_usuarios ALTER COLUMN id SET DEFAULT nextval('public.logs_usuarios_id_seq'::regclass);


--
-- Name: metodos_pago id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodos_pago ALTER COLUMN id SET DEFAULT nextval('public.metodos_pago_id_seq'::regclass);


--
-- Name: paquete_asistencia_medica id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_asistencia_medica ALTER COLUMN id SET DEFAULT nextval('public.paquete_asistencia_medica_id_seq'::regclass);


--
-- Name: paquete_hotel id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_hotel ALTER COLUMN id SET DEFAULT nextval('public.paquete_hotel_id_seq'::regclass);


--
-- Name: paquete_proveedor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_proveedor ALTER COLUMN id SET DEFAULT nextval('public.paquete_proveedor_id_seq'::regclass);


--
-- Name: paquete_tarifas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_tarifas ALTER COLUMN id SET DEFAULT nextval('public.paquete_tarifas_id_seq'::regclass);


--
-- Name: paquete_vuelo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_vuelo ALTER COLUMN id SET DEFAULT nextval('public.paquete_vuelo_id_seq'::regclass);


--
-- Name: paquetes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquetes ALTER COLUMN id SET DEFAULT nextval('public.paquetes_id_seq'::regclass);


--
-- Name: permisos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id SET DEFAULT nextval('public.permisos_id_seq'::regclass);


--
-- Name: permisos_rol id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_rol ALTER COLUMN id SET DEFAULT nextval('public.permisos_rol_id_seq'::regclass);


--
-- Name: permisos_usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_usuario ALTER COLUMN id SET DEFAULT nextval('public.permisos_usuario_id_seq'::regclass);


--
-- Name: personas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas ALTER COLUMN id SET DEFAULT nextval('public.personas_id_seq'::regclass);


--
-- Name: politicas_equipaje id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_equipaje ALTER COLUMN id SET DEFAULT nextval('public.politicas_equipaje_id_seq'::regclass);


--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- Name: responsables id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsables ALTER COLUMN id SET DEFAULT nextval('public.responsables_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: tarjetas_agencia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tarjetas_agencia ALTER COLUMN id SET DEFAULT nextval('public.tarjetas_agencia_id_seq'::regclass);


--
-- Name: tipos_documento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_documento ALTER COLUMN id SET DEFAULT nextval('public.tipos_documento_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: ventas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas ALTER COLUMN id SET DEFAULT nextval('public.ventas_id_seq'::regclass);


--
-- Name: ventas_mensuales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_mensuales ALTER COLUMN id SET DEFAULT nextval('public.ventas_mensuales_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: aerolineas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.aerolineas (id, nombre, codigo_iata, tipo, web) FROM stdin;
2	LATAM	LA	Internacional	https://www.latam.com
3	Copa Airlines	CM	Internacional	https://www.copaair.com
4	American Airlines	AA	Internacional	https://www.aa.com
5	Iberia	IB	Internacional	https://www.iberia.com
6	Delta	DL	Internacional	https://www.delta.com
7	United Airlines	UA	Internacional	https://www.united.com
8	Air France	AF	Internacional	https://www.airfrance.com
9	KLM	KL	Internacional	https://www.klm.com
10	JetBlue	B6	Internacional	https://www.jetblue.com
11	Spirit Airlines	NK	Internacional	https://www.spirit.com
12	Wingo	P5	Nacional	https://www.wingo.com
16	Emirates	EK	Internacional	https://www.emirates.com
17	Turkish Airlines	TK	Internacional	https://www.turkishairlines.com
18	Air Europa	UX	Internacional	https://www.aireuropa.com
20	CLIC AIR	VE	Nacional	https://clicair.co/
1	AVIANCA 	AV	Nacional	https://www.avianca.com
21	Moon Flights	MF	Nacional	https://www.moonflights.com.co/
14	Satena	9R	Nacional	https://www.satena.com
22	JetSmart 	J6	Internacional	https://jetsmart.com/co/es/?utm_source=google&utm_medium=cpc&utm_content=brand&utm_campaign=co_co_jac_g-search_m_brand_jetsmart&gad_source=1
\.


--
-- Data for Name: aeropuertos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.aeropuertos (id, nombre, codigo_iata, ciudad, pais, tipo, status) FROM stdin;
10	Miami	MIA	Miami	Estados Unidos	Internacional	active
11	John F. Kennedy	JFK	New York	Estados Unidos	Internacional	active
12	Adolfo Suárez Madrid-Barajas	MAD	Madrid	España	Internacional	active
13	Charles de Gaulle	CDG	París	Francia	Internacional	active
14	Tocumen	PTY	Ciudad de Panamá	Panamá	Internacional	active
15	Benito Juárez	MEX	Ciudad de México	México	Internacional	active
16	Jorge Chávez	LIM	Lima	Perú	Internacional	active
17	Dubai	DXB	Dubai	Emiratos Árabes Unidos	Internacional	active
18	Estambul	IST	Estambul	Turquía	Internacional	active
1	El Dorado	BOG	Bogotá	Colombia	Ambos	active
2	José María Córdova	MDE	Medellín	Colombia	Ambos	active
23	Olaya Herrera	EOH	Medellín	Colombia	Nacional	active
3	Rafael Núñez	CTG	Cartagena	Colombia	Ambos	active
4	Alfonso Bonilla Aragón	CLO	Cali	Colombia	Ambos	active
5	Gustavo Rojas Pinilla	ADZ	San Andrés	Colombia	Ambos	active
6	Ernesto Cortissoz	BAQ	Barranquilla	Colombia	Ambos	active
7	Matecaña	PEI	Pereira	Colombia	Ambos	active
8	Palonegro	BGA	Bucaramanga	Colombia	Ambos	active
9	Simón Bolívar	SMR	Santa Marta	Colombia	Nacional	active
34	El Edén	AXM	Armenia	Colombia	Ambos	active
35	La Nubia	MZL	Manizales	Colombia	Nacional	active
36	Camilo Daza	CUC	Cúcuta	Colombia	Ambos	active
37	Almirante Padilla	RCH	Riohacha	Colombia	Ambos	active
38	Alfonso López Pumarejo	VUP	Valledupar	Colombia	Nacional	active
22	Los Garzones	MTR	Montería	Colombia	Nacional	active
40	Antonio Roldán Betancourt	APO	Apartadó	Colombia	Nacional	active
41	Las Brujas	CZU	Sincelejo	Colombia	Nacional	active
42	Perales	IBE	Ibagué	Colombia	Nacional	active
43	Benito Salas	NVA	Neiva	Colombia	Nacional	active
44	Guillermo León Valencia	PPN	Popayán	Colombia	Nacional	active
45	San Luis	IPI	Ipiales	Colombia	Nacional	active
46	Antonio Nariño	PSO	Pasto	Colombia	Nacional	active
47	Vanguardia	VVC	Villavicencio	Colombia	Nacional	active
48	El Alcaraván	EYP	Yopal	Colombia	Nacional	active
49	Santiago Pérez Quiroz	AUC	Arauca	Colombia	Nacional	active
20	El Caraño	UIB	Quibdó	Colombia	Nacional	active
51	Yariguíes	EJA	Barrancabermeja	Colombia	Nacional	active
53	José Celestino Mutis	BSC	Bahía Solano	Colombia	Nacional	active
54	Germán Olano	PCR	Puerto Carreño	Colombia	Nacional	active
55	Fabio Alberto León Bentley	MVP	Mitú	Colombia	Nacional	active
56	Jorge Enrique González	SJE	San José del Guaviare	Colombia	Nacional	active
57	Tres de Mayo	PUU	Puerto Asís	Colombia	Nacional	active
58	Alfredo Vásquez Cobo	LET	Leticia	Colombia	Ambos	active
59	Golfo de Morrosquillo	TLU	Tolú	Colombia	Nacional	active
60	Gerardo Tobar López	BUN	Buenaventura	Colombia	Nacional	active
61	San Bernardo	MMP	Mompox	Colombia	Nacional	active
62	Cacique Aramare	PDA	Puerto Inírida	Colombia	Nacional	active
63	La Florida	TCO	Tumaco	Colombia	Nacional	active
64	Eduardo Falla Solano	SVI	San Vicente del Caguán	Colombia	Nacional	active
65	Gustavo Artunduaga	FLA	Florencia	Colombia	Nacional	active
66	Contador	PTX	Pitalito	Colombia	Nacional	active
52	Reyes Murillo	NQU	Nuquí	Colombia	Nacional	active
67	Mandinga	COG	Condoto	Colombia	Nacional	active
68	Capurganá	CPB	Capurganá	Colombia	Nacional	active
69	Alcides Fernández	ACD	Acandí	Colombia	Nacional	active
71	Los Colonizadores	RVE	Saravena	Colombia	Nacional	active
70	Jorge Isaacs	MCJ	Maicao	Colombia	Nacional	active
72	Aeropuerto Juan H. White	CAQ	CAUCASIA	Colombia	Nacional	active
75	PUENTE AEREO TERMINAL 1 	TE1	BOGOTA	Colombia	Nacional	active
76	Aeropuerto Internacional de Cancún	CUN	cancun	mexico	Ambos	active
77	Aeropuerto Internacional La Aurora	GUA	Ciudad de Guatemala	Guatemala	Ambos	active
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes (id, persona_id, creado_por_id, fecha_registro, deleted_at) FROM stdin;
2	11	4	2026-06-10 18:30:14.129	\N
3	12	4	2026-06-10 19:16:35.53	\N
4	13	4	2026-06-10 20:07:08.92	\N
6	15	1	2026-06-10 21:16:31.247	\N
7	16	1	2026-06-10 21:23:10.741	\N
8	17	4	2026-06-10 21:31:49.452	\N
9	21	4	2026-06-10 23:24:30.846	\N
10	23	1	2026-06-12 17:47:03.283	\N
11	24	1	2026-06-12 18:18:39.686	\N
12	35	4	2026-06-14 04:10:20.203	\N
13	36	4	2026-06-14 18:56:08.884	\N
14	14	4	2026-06-16 16:54:56.833	\N
15	18	4	2026-06-17 20:49:54.744	\N
16	19	4	2026-06-17 20:51:27.989	\N
17	20	4	2026-06-17 20:53:23.992	\N
18	39	4	2026-06-18 17:25:20.875	\N
19	40	4	2026-06-18 18:21:08.115	\N
20	41	4	2026-06-18 18:31:19.471	\N
21	42	4	2026-06-18 23:39:49.612	\N
22	43	4	2026-06-19 21:24:28.252	\N
23	6	4	2026-06-21 04:14:42.963	\N
24	7	4	2026-06-21 04:17:12.395	\N
25	8	4	2026-06-22 22:37:50.712	\N
26	9	1	2026-06-23 18:59:13.082	\N
27	10	1	2026-06-23 19:01:13.041	\N
28	45	1	2026-06-24 00:09:35.739	\N
29	46	4	2026-06-24 05:44:00.496	\N
30	44	4	2026-06-26 17:10:28.206	\N
31	48	4	2026-06-26 22:40:43.86	\N
32	49	4	2026-06-29 22:02:09.143	\N
33	50	4	2026-06-29 22:04:12.882	\N
34	51	4	2026-06-30 01:07:24.454	\N
35	52	4	2026-07-03 00:56:45.842	\N
36	55	7	2026-07-03 21:52:00.166	\N
37	57	4	2026-07-05 22:26:23.53	\N
38	58	4	2026-07-06 17:51:16.95	\N
39	59	4	2026-07-06 17:53:21.061	\N
40	60	4	2026-07-06 22:16:35.088	\N
41	61	4	2026-07-10 04:15:42.529	\N
42	62	4	2026-07-13 02:59:34.653	\N
43	63	1	2026-07-16 14:27:33.395	\N
44	64	1	2026-07-16 16:48:14.805	\N
45	65	1	2026-07-18 17:55:32.467	\N
46	5	1	2026-07-23 22:33:09.667	\N
47	72	4	2026-07-24 21:42:13.291	\N
48	73	4	2026-07-28 21:27:22.731	\N
49	74	4	2026-07-28 21:29:39.443	\N
50	75	1	2026-07-29 03:54:39.213	\N
51	76	4	2026-07-30 16:12:03.937	\N
52	77	7	2026-07-30 16:18:03.766	\N
53	78	1	2026-08-01 18:07:17.229	\N
54	79	1	2026-08-01 18:15:16.486	\N
\.


--
-- Data for Name: comisionistas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comisionistas (id, persona_id, tipo, umbral_pago, acumulado, status, creado_at, observacion) FROM stdin;
1	5	Otro	0	0	Activo	2026-06-30 02:02:52.201	\N
2	13	Comisionista	0	0	Activo	2026-08-01 18:50:32.846	\N
\.


--
-- Data for Name: detalle_venta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.detalle_venta (id, venta_id, categoria, nombre_servicio, subtotal, ta, costo_proveedor, proveedor_id, metodo_pago_proveedor_id, voucher_url, fecha_inicio_viaje, fecha_fin_viaje, origen, destino, observaciones, creado_at, ta_cre, parent_detalle_id) FROM stdin;
d59b825f-ab83-4e72-8253-73685d774fc3	7	tiqueteria	Tiquetería	614840	95000	519840	8	12	\N	\N	\N	UIB	BOG	\N	2026-06-13 22:46:41.608	0	\N
deeacbe5-03f5-48c7-a6f1-5d29694e0430	16	tiqueteria	Tiquetería	600000	50010	549990	8	12	\N	\N	\N	BAQ	BOG	\N	2026-06-13 23:43:39.015	0	\N
07ffe0e9-18fd-49fc-8ade-f31f8dfe3378	17	tiqueteria	Tiquetería	614840	95000	519840	8	12	\N	\N	\N	UIB	BOG	\N	2026-06-14 01:25:28.971	0	\N
ff8dad0e-bf25-4ac9-9603-1e96994008be	18	tiqueteria	Tiquetería	811110	85000	726110	8	12	\N	\N	\N	BAQ	BOG	\N	2026-06-14 01:36:16.674	0	\N
a4ab0d05-0364-4e66-8928-09df7f788325	19	tiqueteria	Tiquetería	830400	85000	745400	9	13	\N	\N	\N	EOH	MTR	\N	2026-06-14 04:37:56.955	0	\N
f022e59d-7872-4ecb-86d7-012326df6e57	20	tiqueteria	Tiquetería	485300	85000	400300	9	13	\N	\N	\N	EOH	UIB	\N	2026-06-14 19:10:34.986	0	\N
4180954d-17d9-4b53-ad0a-275b34b9dac6	21	tiqueteria	Tiquetería	783800	85000	698800	9	13	\N	\N	\N	UIB	EOH	\N	2026-06-16 17:09:08.485	0	\N
ceb44ab2-69f0-4cf4-bac9-73bb3cc9affc	22	tiqueteria	Tiquetería	687600	85000	602600	9	13	\N	\N	\N	EOH	UIB	\N	2026-06-17 04:15:41.988	0	\N
fd547479-723b-4a91-abea-518563a9238c	23	tiqueteria	Tiquetería	1096000	85480	1010520	1	14	\N	\N	\N	BAQ	BOG	\N	2026-06-17 21:26:53.884	0	\N
4b2f7379-34f7-45e6-9101-2aa187987049	24	tiqueteria	Tiquetería	1096360	85840	1010520	1	14	\N	\N	\N	BAQ	BOG	\N	2026-06-17 21:37:05.451	0	\N
9824a76d-4ea3-4205-b6bb-7dbb84a3d9fb	25	tiqueteria	Tiquetería	1096000	85480	1010520	1	14	\N	\N	\N	BAQ	BOG	\N	2026-06-17 21:44:53.311	0	\N
38ae1568-5ed0-42c1-a2af-047bf61ca2b4	26	tiqueteria	Tiquetería	425000	55200	369800	1	14	\N	\N	\N	CAQ	EOH	\N	2026-06-18 17:51:44.904	0	\N
bc583ec7-c007-4236-8d14-1ecf1a627fef	27	tiqueteria	Tiquetería	2292000	243244	2048756	1	14	\N	\N	\N	UIB	TE1	\N	2026-06-18 19:31:53.552	0	\N
cf517aae-1be5-4949-b6d5-ef51614b5e89	28	tiqueteria	Tiquetería	800000	152590	647410	1	14	\N	\N	\N	EOH	UIB	\N	2026-06-18 22:37:12.991	0	\N
e1ac8d9e-9efc-41a8-b6f2-8a85dd472fe6	29	tiqueteria	Tiquetería	334000	100824	233176	1	14	\N	\N	\N	EOH	UIB	\N	2026-06-18 22:57:50.923	0	\N
2a07304c-c890-456e-940a-11487e9f1465	30	tiqueteria	Tiquetería	347000	96100	250900	1	14	\N	\N	\N	UIB	EOH	\N	2026-06-18 23:06:41.03	0	\N
31b21b7b-cded-4756-93d5-e85d1e0efb62	31	tiqueteria	Tiquetería	449000	55300	393700	1	14	\N	\N	\N	UIB	EOH	\N	2026-06-18 23:12:19.071	0	\N
cb25ec65-08aa-4ed9-bf4e-8cb6c5ee5260	32	tiqueteria	Tiquetería	253000	85150	167850	1	14	\N	\N	\N	EOH	UIB	\N	2026-06-18 23:22:42.289	0	\N
0460bbac-5ebb-441a-870f-0019dcdf3d81	33	tiqueteria	Tiquetería	330000	125510	204490	1	14	\N	\N	\N	UIB	EOH	\N	2026-06-18 23:34:46.784	0	\N
5167b692-0ded-43c5-aee3-a41535e656b1	34	tiqueteria	Tiquetería	277000	90550	186450	1	14	\N	\N	\N	UIB	EOH	\N	2026-06-18 23:50:34.641	0	\N
9e57d3ca-a0a9-4ac8-9c2a-b564d0aafc8d	35	tiqueteria	Tiquetería	301000	85550	215450	1	14	\N	\N	\N	UIB	EOH	\N	2026-06-18 23:58:23.63	0	\N
9fe77905-ed72-4e4c-a0a2-e6665f4f874e	36	tiqueteria	Tiquetería	1266800	170000	1096800	9	13	\N	\N	\N	MTR	EOH	\N	2026-06-19 04:14:49.882	0	\N
5b61785d-8c5a-431e-8491-11838e518ba5	38	tiqueteria	Tiquetería	3420800	300000	3120800	9	13	\N	\N	\N	UIB	EOH	\N	2026-06-23 21:09:25.62	0	\N
48bf7c17-babb-4da4-a42d-2b9a397664ae	40	tiqueteria	Tiquetería	335900	85000	250900	9	13	\N	\N	\N	UIB	EOH	\N	2026-06-24 06:02:41.76	0	\N
ab8c0c6c-2f42-4259-83f5-a28e19acd9ef	42	tiqueteria	Tiquetería	498000	85000	413000	1	14	\N	\N	\N	EOH	UIB	\N	2026-06-24 23:50:30.852	0	\N
c00fdbff-eaa5-46ff-b7da-bcc0e708595a	43	planes	Planes	6235000	333794	5901206	1	2	\N	\N	\N	\N	\N	Plan San Andres - Hotel Sol Caribe Centro\n	2026-06-25 21:36:21.689	0	\N
14509d4b-184a-4c06-a7e3-dd9621243582	44	tiqueteria	Tiquetería	490726	85000	405726	11	2	\N	\N	\N	EOH	UIB	\N	2026-06-26 17:41:46.636	0	\N
78caad25-7c9f-452e-a856-30966c6196da	45	tiqueteria	Tiquetería	963000	138520	824480	10	2	\N	\N	\N	UIB	BOG	\N	2026-06-26 23:09:15.88	0	\N
4a208974-2b1b-46a7-a6c9-589ad8460638	46	tiqueteria	Tiquetería	1302852	100000	1202852	11	2	\N	\N	\N	UIB	EOH	\N	2026-06-29 22:13:46.525	0	\N
c203d8f7-3fd4-4776-9942-e31231f8476e	47	tiqueteria	Tiquetería	923730	200000	723730	10	2	\N	\N	\N	CLO	BOG	\N	2026-06-30 02:12:26.022	0	\N
49427b3f-a03e-4e42-8a57-ec5014b71724	48	tiqueteria	Tiquetería	664000	200000	464000	10	2	\N	\N	\N	BOG	PEI	\N	2026-07-01 17:39:23.568	0	\N
4d9fe61e-3ac4-47ae-8dd8-9bf4b3a72719	50	tiqueteria	Tiquetería	530350	125000	405350	28	2	\N	\N	\N	BSC	CLO	\N	2026-07-03 02:21:16.521	0	\N
f1b6cc8f-8c8b-445c-837b-1baa2754da32	51	tiqueteria	Tiquetería	797096	232000	565096	11	2	\N	\N	\N	EOH	APO	\N	2026-07-04 18:29:49.503	0	\N
9afcb13f-a90b-4da2-b47d-781a65e474d2	52	tiqueteria	Tiquetería	912175	234029	678146	11	2	\N	\N	\N	EOH	APO	\N	2026-07-04 19:26:11.629	0	\N
a6c0f797-285d-4cc9-ad99-79d25e0dc2a3	53	tiqueteria	Tiquetería	913000	234854	678146	11	2	\N	\N	\N	EOH	APO	\N	2026-07-05 06:46:01.561	0	\N
fc5e1cbd-df68-4643-99ac-a0390a1dec56	54	tiqueteria	Tiquetería	942600	242100	700500	28	2	\N	\N	\N	UIB	BSC	\N	2026-07-06 00:12:38.225	0	\N
c58bc837-f601-4944-bfa6-85fe4c240288	55	tiqueteria	Tiquetería	517600	254800	262800	9	13	\N	\N	\N	PEI	EOH	\N	2026-07-06 00:51:12.36	0	\N
7b85c17a-c123-4f9c-bf8a-0f841f9bd47f	56	tiqueteria	Tiquetería	1087386	400000	687386	11	2	\N	\N	\N	PEI	MDE	\N	2026-07-06 18:01:06.88	0	\N
44919fbf-fdff-4879-b7ee-d50576631f4c	57	tiqueteria	Tiquetería	1280000	349900	930100	10	2	\N	\N	\N	CUN	MDE	\N	2026-07-06 22:38:01.758	0	\N
bc9a3854-0e58-454a-a8bf-46b269f29d85	58	tiqueteria	Tiquetería	1280000	349900	930100	10	2	\N	\N	\N	CUN	MDE	\N	2026-07-06 22:45:40.742	0	\N
0e105751-5bcd-4c19-a5a3-dd7e6e3e8703	3	tiqueteria	Tiquetería	750490	70000	680490	8	1	\N	\N	\N	MDE	MTR	\N	2026-06-12 02:33:35.705	0	\N
e5e49999-bd1f-4af9-9aa0-083a26fc304e	4	tiqueteria	Tiquetería	796900	70000	726900	9	1	\N	\N	\N	UIB	EOH	\N	2026-06-12 03:18:45.684	0	\N
699e62fb-6f51-410d-aaae-386d8c06d02f	5	tiqueteria	Tiquetería	481000	134900	346100	9	12	\N	\N	\N	UIB	EOH	\N	2026-06-12 20:32:04.913	0	\N
e5d72839-e428-4b1b-8ee7-9971fd98c2a1	6	tiqueteria	Tiquetería	481000	134900	346100	9	1	\N	\N	\N	UIB	EOH	\N	2026-06-12 20:55:48.668	0	\N
c77f5949-279d-48bd-84af-c87739af2f29	59	tiqueteria	Tiquetería	545300	145000	400300	9	13	\N	\N	\N	EOH	UIB	\N	2026-07-07 01:48:06.212	0	\N
406bc393-fb2b-4219-95e3-bc424a930ab7	60	tiqueteria	Tiquetería	592900	145000	447900	9	13	\N	\N	\N	EOH	UIB	\N	2026-07-07 02:00:00.026	0	\N
37c9e53a-6e57-430b-8d48-ae594816a367	61	tiqueteria	Tiquetería	866352	400000	466352	11	2	\N	\N	\N	EOH	UIB	\N	2026-07-07 21:08:08.095	0	\N
4c9281f9-67f4-4051-b45c-9838c8b225b2	62	tiqueteria	Tiquetería	400400	250000	150400	9	13	\N	\N	\N	EOH	TE1	\N	2026-07-08 23:42:59.37	0	\N
c27e8e9f-edef-463f-8c74-0dad4b9964f6	63	tiqueteria	Tiquetería	1124000	443207	680793	\N	2	\N	\N	\N	BOG	CLO	\N	2026-07-09 22:02:49.935	0	\N
d72182d2-d133-415b-90a2-8704c41d36e1	64	tiqueteria	Tiquetería	339300	111550	227750	9	13	\N	\N	\N	EOH	UIB	\N	2026-07-10 04:21:14.597	0	\N
62fd4d18-568d-42f3-9bbb-43399e83f3de	65	tiqueteria	Tiquetería	752546	300000	452546	11	2	\N	\N	\N	EOH	UIB	\N	2026-07-13 03:12:51.071	0	\N
bc8b21f5-c10e-4e81-a9aa-66d80a00c58e	66	tiqueteria	Tiquetería	519000	150000	369000	1	2	\N	\N	\N	BSC	UIB	\N	2026-07-15 00:11:46.699	0	\N
ee603ba1-7714-4366-8c4a-c5469bfe78f2	67	tiqueteria	Tiquetería	267850	45000	222850	1	2	\N	\N	\N	EOH	UIB	\N	2026-07-16 15:52:16.579	0	\N
d7f3b304-8e6e-4d0f-95d2-0be1c8eceb8e	68	tiqueteria	Tiquetería	365000	50000	315000	1	2	\N	\N	\N	MMP	EOH	\N	2026-07-16 19:53:13.526	0	\N
4e65aefb-05ea-4c36-826f-a3b03ec5dfbe	70	tiqueteria	Tiquetería	617000	110880	506120	1	2	\N	\N	\N	CLO	BSC	\N	2026-07-17 22:46:33.549	0	\N
e6e76f1d-287b-43a4-b275-1a1402ef46c5	71	tiqueteria	Tiquetería	423000	55000	368000	1	2	\N	\N	\N	BSC	CLO	\N	2026-07-17 22:52:22.504	0	\N
4b8eaec3-da05-4ebd-ae33-9d25e0facaa5	73	tiqueteria	Tiquetería	409750	44000	365750	12	2	\N	\N	\N	EOH	UIB	\N	2026-07-18 19:41:54.58	0	\N
8279218a-4ca0-44aa-b71a-31241822c5e6	82	tiqueteria	Tiquetería	188850	20000	168850	9	13	\N	\N	\N	EOH	UIB	\N	2026-07-23 22:44:49.138	0	\N
3fab42bd-7291-41cc-957f-491f20b2afbc	83	tiqueteria	Tiquetería	1735000	531117	1203883	11	2	\N	\N	\N	MDE	PTY	\N	2026-07-24 23:01:40.833	0	\N
e2a9d970-3567-4941-ab5a-884aa2cc3550	85	planes	Planes	0	0	0	\N	\N	\N	\N	\N	\N	\N	\N	2026-07-28 23:20:36.341	0	\N
eb966ed6-f559-4a35-81b4-5a6e9138b3e3	85	planes	Planes	0	0	0	25	\N	\N	\N	\N	\N	\N	Incluye: TIQUTES AEREOS MEDELLIN SAN ANDRES MEDELLIN SALIDA EL DIA 4 DE ENERO AL 8 DE 2007, ICLUYE LA ALIMENTACION FULL, SANKS BAR ABIERTO\nNo Incluye: GASTOS NO ESPECIFICADOS EN EL VOUCHER, ENTRADA A LA ISLA	2026-07-28 23:20:36.341	0	\N
e99b7a7a-a258-4f88-87b1-c048cd95efa7	85	planes	Planes	7758000	811200	6946800	25	2	\N	2027-01-04 20:00:00	2027-01-08 17:00:00	\N	\N	Incluye: TIQUTES AEREOS MEDELLIN SAN ANDRES MEDELLIN SALIDA EL DIA 4 DE ENERO AL 8 DE 2007, ICLUYE LA ALIMENTACION FULL, SANKS BAR ABIERTO\nNo Incluye: GASTOS NO ESPECIFICADOS EN EL VOUCHER, ENTRADA A LA ISLA	2026-07-28 23:20:36.341	0	\N
3fa320f5-83ae-4dd3-a53a-09b2a7e2db0b	85	planes	Planes	0	0	0	25	\N	\N	\N	\N	\N	\N	Incluye: TIQUTES AEREOS MEDELLIN SAN ANDRES MEDELLIN SALIDA EL DIA 4 DE ENERO AL 8 DE 2007, ICLUYE LA ALIMENTACION FULL, SANKS BAR ABIERTO\nNo Incluye: GASTOS NO ESPECIFICADOS EN EL VOUCHER, ENTRADA A LA ISLA	2026-07-28 23:20:36.341	0	\N
b8f43d76-8413-4083-bb41-2c8e91e90d7b	86	tiqueteria	Tiquetería	867000	250700	616300	10	2	\N	\N	\N	CLO	BOG	\N	2026-07-29 21:44:11.19	0	\N
8706e8b7-db53-453d-a647-cb48e9cacffa	87	tiqueteria	Tiquetería	867000	250370	616630	10	2	\N	\N	\N	CLO	MDE	\N	2026-07-29 23:51:51.509	0	\N
47356ef7-3b76-4c50-abd2-d7317046345d	88	tiqueteria	Tiquetería	900000	80683	577266	11	2	\N	\N	\N	MDE	CLO	\N	2026-07-30 12:24:18.847	242051	\N
8202e81a-97a8-4c0e-bd00-22ae9c713ed9	84	tiqueteria	Tiquetería	900000	80683	577266	11	2	\N	\N	\N	MDE	CLO	\N	2026-07-25 19:14:47.776	242051	\N
b7c39e56-6fd8-4f9d-a46e-c295e86484e3	89	tiqueteria	Tiquetería	589576	85000	304576	11	2	\N	\N	\N	EOH	UIB	\N	2026-08-01 00:08:45.48	200000	\N
948d3a43-3c94-45b9-ada9-a71fb51af927	90	tiqueteria	Tiquetería	434500	46750	387750	1	2	\N	\N	\N	UIB	EOH	\N	2026-08-01 19:57:31.711	0	\N
cc5feeac-bed3-4ae2-913a-aec7c7aad4c3	91	tiqueteria	Tiquetería	434500	46750	387750	1	2	\N	\N	\N	UIB	EOH	\N	2026-08-01 20:01:43.243	0	\N
\.


--
-- Data for Name: liquidacion_ventas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.liquidacion_ventas (id, liquidacion_id, venta_id) FROM stdin;
\.


--
-- Data for Name: liquidaciones_comision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.liquidaciones_comision (id, comisionista_id, fecha, monto, metodo_pago_id, referencia, notas, creado_at) FROM stdin;
\.


--
-- Data for Name: logs_usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logs_usuarios (id, usuario_id, accion, modulo, descripcion, fecha) FROM stdin;
\.


--
-- Data for Name: metodos_pago; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.metodos_pago (id, nombre) FROM stdin;
1	Efectivo
2	Transferencia
3	Tarjeta de Crédito
4	Tarjeta Débito
6	Consignación
8	Llaves
9	Tarjeta Davivienda
11	Credito
13	Tarjeta de Débito
12	CTA CTE 2060
14	Tarjeta de Bancolombia
\.


--
-- Data for Name: pagos_venta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pagos_venta (id, venta_id, monto, metodo_pago_id, referencia, fecha_pago) FROM stdin;
7bc914c9-0b4d-49da-9f9a-5c89449fbca8	30	347000	2	\N	2026-06-18 23:07:07.415
4d98e968-ea53-4b36-b888-90cf509f9d8d	31	449000	2	\N	2026-06-18 23:12:46.441
2d7b1d40-3feb-4d38-908c-395f9bf696da	32	253000	2	\N	2026-06-18 23:23:04.251
a2f68b1a-82b9-458a-b26e-bb512f557ef3	33	330000	2	\N	2026-06-18 23:34:46.784
6f3480db-1793-4090-99d1-b27f91dbe4cf	34	277000	2	\N	2026-06-18 23:50:34.641
9cc3e32b-742d-4562-bd39-1508f8c959b1	35	301000	2	\N	2026-06-18 23:58:23.63
7508ea94-5a64-4ff0-8b05-8789174c7a83	18	811110	2	\N	2026-06-19 05:17:12.463
13bb3959-ca62-409c-b288-30443ae110cd	20	485300	2	\N	2026-06-19 05:25:39.795
6de63282-1056-4d91-92ae-2f6dff6fa124	21	783800	2	\N	2026-06-19 05:26:13.439
d3d47181-2aea-4f4f-95eb-cee3f005d3df	5	481000	2	\N	2026-06-19 05:27:18.149
50edccac-c760-42df-aac0-8c3a7c06e378	6	481000	2	\N	2026-06-19 05:27:44.786
58c2cb2d-66ac-4a6b-9dc5-22b0c27782b5	19	830400	2	\N	2026-06-20 04:16:23.002
ca37bc93-4c8e-4ee9-9450-6112fd9c4827	38	3420800	2	\N	2026-06-23 21:09:25.62
001b7a00-65bb-4b41-ab1e-dd132427d820	36	1266800	2	\N	2026-06-23 22:35:39.405
4799ccac-918c-4224-80b7-7acbc59d0d96	27	233200	2	\N	2026-06-23 22:37:25.026
ffaa7a6c-3ce2-4a62-82d6-846382a62e0d	43	6235000	2	\N	2026-06-25 21:36:21.689
84419b38-1dc8-4db7-8fa8-6260d912dcab	46	1302852	2	\N	2026-06-30 00:55:08.631
0e029e1f-9bc2-44b3-81c9-7854d9d263fd	3	750490	2	\N	2026-07-01 20:58:11.852
16d5ab3a-db40-4d12-8936-8206539411ba	4	796900	2	\N	2026-07-01 20:59:08.763
971c4b17-23d5-4d04-8590-c14b1bc078de	22	687600	2	\N	2026-07-01 21:00:26.743
296bcd6f-52ed-42f1-8aae-84e10a975847	44	490726	2	\N	2026-07-01 21:01:11.735
6809c425-6898-4598-857a-36df82cda17e	27	2058800	2	\N	2026-07-02 21:16:06.361
2445d981-b5c4-4fe3-b31c-e65366867ee4	40	335900	2	\N	2026-07-02 21:28:55.745
4c9ba862-6988-436b-b320-653b76cfae5b	42	107000	2	\N	2026-07-02 21:29:27.978
6a969201-530d-45d1-bc77-56686148aefc	42	391000	2	190409	2026-07-06 21:42:18.557
f9ce91a8-5ef3-4ebf-b2ac-a13654326b4b	45	963000	2	190405	2026-07-06 21:43:59.188
e929dfd5-c84a-4267-8c83-ae770d29afa1	57	1280000	2	40600	2026-07-09 01:21:09.161
e906f111-41af-4b0b-8fd3-07c2b6a159ff	58	666000	2	40600	2026-07-09 01:23:23.285
004f7ea9-40be-4558-bc12-29ee6a1b40d9	58	614000	2	30600	2026-07-10 21:42:55.4
1ef95ca8-ded3-4117-b5a0-2ffce5b6476d	61	866352	2	3066	2026-07-10 21:43:53.42
fce1e43a-6ca6-440c-b196-00773f0f7688	53	913000	2	0686	2026-07-12 00:25:36.727
9ac5a8a7-98e0-44c4-80ee-e4be187aba78	50	530350	2	83900	2026-07-14 21:45:02.437
2aa4381d-5e54-4bd9-94ec-42b087bb075c	51	500150	2	83900	2026-07-14 21:46:17.603
24c666ac-1c5c-4a47-a38c-24d3a762e816	67	267850	2	30800	2026-07-16 15:52:16.579
9aba525f-ff0a-441d-ba0c-3f84c7217a82	68	365000	2	00600	2026-07-16 19:53:13.526
c5dc5096-fdca-4fc4-8078-8a7dbd18802e	70	617000	2	\N	2026-07-17 22:46:33.549
b27b1231-02bd-4975-a791-6da0dfe42993	71	423000	2	\N	2026-07-17 22:52:22.504
e03b201f-3b9a-48ec-92f2-11b8f81706d1	73	409750	2	94700	2026-07-18 19:41:54.58
fd30e72f-56e9-4f8e-b75f-9aaad951ded3	64	339300	2	\N	2026-07-21 21:34:11.501
a775d863-59b7-4a70-933a-0fb9bcbbda2a	64	339300	2	\N	2026-07-21 21:34:23.243
12b96208-35fd-480d-b84c-cdd68aa83927	65	752546	2	\N	2026-07-22 17:02:19.853
cc8d212c-2395-4910-9364-decffab82258	7	614840	2	\N	2026-06-13 22:46:41.608
fa3ef8a9-b3ef-4686-9bb0-63d30f8c8925	16	600000	2	\N	2026-06-13 23:43:39.015
b7ce89c7-448e-4f8d-bb8e-7c09721f53d8	17	614840	2	\N	2026-06-14 01:25:28.971
c11c64b6-2a31-4b1e-8035-d6866a5fc8ab	83	1735000	2	\N	2026-07-24 23:01:40.833
daaed541-ffb2-4de8-9777-e63469c38ae4	47	923730	2	\N	2026-07-25 22:53:04.492
64beb498-447a-4a77-902b-2923417300c3	26	425000	2	\N	2026-06-18 21:31:01.94
92ecc68e-b80f-41d1-ab67-010643f0e4f1	25	1096000	2	\N	2026-06-18 22:00:59.543
8ccd78e6-d443-43f7-ae33-5953cb542628	24	1096000	2	\N	2026-06-18 22:01:27.069
3c2f3a57-10ca-4d72-9e5f-9578a86dab26	24	360	2	\N	2026-06-18 22:03:18.716
bcd378b4-cd26-4d2a-badc-112403cbde04	23	1096000	2	\N	2026-06-18 22:04:48.433
f242ddd0-43d7-4b42-8302-e9ac5f5d360c	28	145600	2	\N	2026-06-18 22:41:31.023
0c550394-fdbd-44b3-9e01-4c7dafa4c1ce	28	654400	2	\N	2026-06-18 22:41:39.269
8f16977f-2893-4138-8290-f75a4e0a34f5	48	664000	2	\N	2026-07-25 22:55:29.681
3223667b-ca25-46cf-942a-384ee72a5887	29	334000	2	\N	2026-06-18 22:58:45.058
8df36ec6-38fc-4964-8509-c1a5d46e003a	52	912175	2	\N	2026-07-25 22:57:11.423
5307d4ac-bd30-4768-99a4-3bdf43f7968e	85	7758000	2	\N	2026-07-28 23:20:36.341
707272d1-ed20-454b-ba89-79fac306d23f	88	900000	1	\N	2026-07-30 12:24:18.847
8368705c-81c9-4c09-ad3c-22174a90a03f	84	900000	1	\N	2026-07-25 19:14:47.776
cbe9f3c4-0c60-4351-aef0-77537fc00af4	90	434500	2	\N	2026-08-01 19:57:31.711
18d305a5-e100-41dd-98b7-6b5668884e29	91	434500	2	\N	2026-08-01 20:01:43.243
\.


--
-- Data for Name: paquete_asistencia_medica; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paquete_asistencia_medica (id, paquete_id, cobertura_usd, dias_cobertura) FROM stdin;
\.


--
-- Data for Name: paquete_hotel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paquete_hotel (id, paquete_id, hotel_nombre, tipo_hotel, regimen, noches) FROM stdin;
1	1	SOL CARIBE CAMPO	hotel	full	4
\.


--
-- Data for Name: paquete_proveedor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paquete_proveedor (id, paquete_id, proveedor_id) FROM stdin;
1	1	25
\.


--
-- Data for Name: paquete_tarifas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paquete_tarifas (id, paquete_id, tarifa_adulto, tarifa_menor, vigencia_desde, vigencia_hasta) FROM stdin;
\.


--
-- Data for Name: paquete_vuelo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paquete_vuelo (id, paquete_id, aerolinea_id, nro_vuelo, modo_vuelo, plan_equipaje, trayectos, tipo_transporte) FROM stdin;
1	1	1	MED ADZ MED	round_trip	\N	{"legs": [{"seat": "", "origin": "MEX", "destination": "", "flightNumber": ""}], "returnLeg": {"origin": "MDE", "destination": "ADZ"}}	Aéreo
\.


--
-- Data for Name: paquetes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paquetes (id, nombre, destino, servicios_incluidos, no_incluido, status, creado_por_id, creado_at, deleted_at) FROM stdin;
1	TEMPORADA ALTA ADZ	 SAN ANDRES	TIQUTES AEREOS MEDELLIN SAN ANDRES MEDELLIN SALIDA EL DIA 4 DE ENERO AL 8 DE 2007, ICLUYE LA ALIMENTACION FULL, SANKS BAR ABIERTO	GASTOS NO ESPECIFICADOS EN EL VOUCHER, ENTRADA A LA ISLA	activo	4	2026-07-28 22:22:39.104	\N
\.


--
-- Data for Name: pasajeros_detalle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pasajeros_detalle (id, detalle_venta_id, persona_id, es_titular, asiento, nota, nro_reserva, nro_tiquete) FROM stdin;
14ca8cd9-2c9d-4437-a406-3e6ad36fecb7	0e105751-5bcd-4c19-a5a3-dd7e6e3e8703	13	t	\N	\N	\N	\N
a3f8bd9a-5d67-4efe-a8e9-af9159fffbd0	e5e49999-bd1f-4af9-9aa0-083a26fc304e	13	t	10D	\N	\N	\N
54c5cc5b-230c-4201-b13f-d0082f0bb33b	699e62fb-6f51-410d-aaae-386d8c06d02f	23	t	\N	\N	\N	\N
625ec228-43d8-45f2-9f8a-1f1a89e89f5e	e5d72839-e428-4b1b-8ee7-9971fd98c2a1	24	t	\N	\N	\N	\N
875e9d4a-d434-4fde-b6d7-fcfadbee5a79	d59b825f-ab83-4e72-8253-73685d774fc3	11	t	4B	\N	BN3VQK	1342156750205
b7f72a1f-928c-4f88-81ee-248d81d2224c	deeacbe5-03f5-48c7-a6f1-5d29694e0430	11	t	8A	\N	ATXBPK	1342156938471
c87720fe-9041-49b2-9234-101166e7c069	07ffe0e9-18fd-49fc-8ade-f31f8dfe3378	12	t	\N	\N	BN3VQK	1342156750204
f5892440-8b2c-49e3-88d8-0ca6e4261619	ff8dad0e-bf25-4ac9-9603-1e96994008be	12	t	\N	\N	BF9PWF	1342156996655
7cf60f59-8c4a-4883-9c4a-03c43ffbf7ff	a4ab0d05-0364-4e66-8928-09df7f788325	35	t	11A	\N	LIHNLX	246033333440
7634663a-934f-4859-9d51-98636f10761d	a4ab0d05-0364-4e66-8928-09df7f788325	35	f	11A	\N	LIHNLX	\N
509f50b2-cdec-4494-bcd1-2efb222e1524	f022e59d-7872-4ecb-86d7-012326df6e57	36	t	\N	\N	KASVGN	2460333334406
ceb420c6-74e8-4137-a40b-427c1f4efa97	4180954d-17d9-4b53-ad0a-275b34b9dac6	14	t	\N	\N	LNAJFF	460333334407
a23e0ab8-a11e-4951-b74d-4413bba5a5c8	ceb44ab2-69f0-4cf4-bac9-73bb3cc9affc	13	t	\N	\N	KAGUGA	2460333334408
507c7f0a-f8cd-4fac-a26e-cf2e2e7726ca	fd547479-723b-4a91-abea-518563a9238c	18	t	\N	\N	ABXD5I	1342157308810
a4602097-f19c-4a62-bdad-a052d659f15e	4b2f7379-34f7-45e6-9101-2aa187987049	19	t	\N	\N	AV9531	1342157308809
968f2f1e-db3e-4c2d-8421-1794d41fac90	9824a76d-4ea3-4205-b6bb-7dbb84a3d9fb	20	t	\N	\N	AV9531	1342157310068
8e17309d-6806-4da8-87e6-fdf66498a868	38ae1568-5ed0-42c1-a2af-047bf61ca2b4	39	t	\N	\N	HUWEPN	0192463344850
186f49aa-9509-48b3-aba3-dab4d30de86b	bc583ec7-c007-4236-8d14-1ecf1a627fef	40	t	\N	\N	XHMUQS	135609999
d3f20139-359f-44a7-84ff-af4b11d070f6	bc583ec7-c007-4236-8d14-1ecf1a627fef	41	f	\N	\N	XHMUQS	135609960
a2fbaefe-c691-4e40-833e-e10b2d39998d	cf517aae-1be5-4949-b6d5-ef51614b5e89	41	t	\N	\N	VARBJJ	2460333251531
0dbbaa85-627c-419e-87c7-fae5f7aea53c	e1ac8d9e-9efc-41a8-b6f2-8a85dd472fe6	13	t	\N	\N	YFQDVS	135471725
588d6fdb-8233-4d27-a663-f14dda9ffcdc	2a07304c-c890-456e-940a-11487e9f1465	13	t	\N	\N	OQGBFW	0192463344807
39622907-dc7f-495c-9f0c-23b5e2031ea4	31b21b7b-cded-4756-93d5-e85d1e0efb62	13	t	\N	\N	BXNRTQ	2460333251585
1a924ec9-f142-414e-b2d2-1ce16b0acb64	cb25ec65-08aa-4ed9-bf4e-8cb6c5ee5260	21	t	\N	\N	LMKHIO	2460333251534
54dc50c1-458f-4dfe-992b-ab8fab9d10e4	0460bbac-5ebb-441a-870f-0019dcdf3d81	36	t	\N	\N	BSTLOZ	0192463354234
ae666380-98db-49d3-9002-7e0a2b45e7ff	5167b692-0ded-43c5-aee3-a41535e656b1	42	t	\N	\N	CRIMWF	2460333251535
786eef47-57cd-4fb9-951f-c0a2cfe2be17	9e57d3ca-a0a9-4ac8-9c2a-b564d0aafc8d	42	t	\N	\N	CRIMWF	2460333251560
42b4d5aa-051f-42f1-a4fa-580b70ad25c7	9fe77905-ed72-4e4c-a0a2-e6665f4f874e	23	t	\N	\N	PUQFBC	2460333334409
3678be0c-43d7-4385-b03c-1bdf458126b9	9fe77905-ed72-4e4c-a0a2-e6665f4f874e	24	f	\N	\N	PUQFBC	2460333334410
67049678-068b-416a-afa6-79ec34ea4906	5b61785d-8c5a-431e-8491-11838e518ba5	9	t	\N	\N	WHUBQS	2460333334412
0524f16a-1a5c-478c-9b89-a0c63dbbb76f	48bf7c17-babb-4da4-a42d-2b9a397664ae	46	t	\N	\N	NEXUEO	2460333334413
5812c1e8-fd73-4d50-8f00-edccf3878f95	ab8c0c6c-2f42-4259-83f5-a28e19acd9ef	41	t	\N	\N	CRVPWY	2460333341138
fcbc0ab8-5cf6-4b35-b6d9-3531c20b70eb	c00fdbff-eaa5-46ff-b7da-bcc0e708595a	6	t	\N	\N	\N	\N
ed48ffbc-eaf8-4ee6-9450-20ed3410d4e7	14509d4b-184a-4c06-a7e3-dd9621243582	13	t	8A	\N	CIYIHX	2460333316642
c56e820f-ab37-4084-82c0-41ea181e7550	78caad25-7c9f-452e-a856-30966c6196da	48	t	\N	\N	CZ8YJ9	1342157697501
83576d4f-6778-4a3d-86cf-6dda246099c0	4a208974-2b1b-46a7-a6c9-589ad8460638	49	t	\N	\N	ZAZRYR	135675898
9def373a-11ae-488b-904f-7bd2f9c7145c	4a208974-2b1b-46a7-a6c9-589ad8460638	50	f	\N	\N	ZAZRYR	\N
eb8ea112-f48a-467a-8227-9b0686477090	c203d8f7-3fd4-4776-9942-e31231f8476e	51	t	\N	\N	BK77S6	1342157786459
d479087c-67bf-4b31-a312-f0592f4b08f8	49427b3f-a03e-4e42-8a57-ec5014b71724	51	t	\N	\N	CFMTWA	1342157849364
bde3272a-5e93-4ec8-b65d-1adc7ba0a9fe	4d9fe61e-3ac4-47ae-8dd8-9bf4b3a72719	44	t	\N	\N	3ZJ9PA	0010002091654
19858d18-53df-4c72-84e1-00d0d75b2ee4	f1b6cc8f-8c8b-445c-837b-1baa2754da32	44	t	\N	\N	XFFDRM	135709786
38122c91-43fa-4f02-ab77-586931dc0f3c	9afcb13f-a90b-4da2-b47d-781a65e474d2	51	t	\N	\N	BASHNZ	135710128
6d7da70d-e97d-4fc2-a144-7d73e1739393	a6c0f797-285d-4cc9-ad99-79d25e0dc2a3	55	t	\N	\N	ODKPOD	135712602
9cb35465-161a-427d-8341-ccd756c81698	fc5e1cbd-df68-4643-99ac-a0390a1dec56	57	t	\N	\N	D7IU56	0010002097910
f59fb12c-e1f9-4e1a-a8d0-fd3adac546cc	c58bc837-f601-4944-bfa6-85fe4c240288	51	t	\N	\N	TQAFED	2460333334414
a7eee27d-35ad-4496-a360-07d80356e030	7b85c17a-c123-4f9c-bf8a-0f841f9bd47f	58	t	\N	\N	LA0351	135718991
c8d6a8ca-736f-4905-810b-b81b0c0320a1	7b85c17a-c123-4f9c-bf8a-0f841f9bd47f	59	f	\N	\N	LA0351	135718991
fe6f8c26-e4d9-4b83-9217-68bd658a6502	44919fbf-fdff-4879-b7ee-d50576631f4c	40	t	\N	\N	C32F9P	1342158050390
adcf4277-0395-433c-a000-b533fd3f737e	bc9a3854-0e58-454a-a8bf-46b269f29d85	60	t	\N	\N	C32F9P	1342158050390
b857e8e8-ebea-4451-af1e-f911859caa52	c77f5949-279d-48bd-84af-c87739af2f29	58	t	\N	\N	VLVFSF	2460333334415
2a47fdd1-cc4c-4fc2-b7c0-678dc15dff4b	406bc393-fb2b-4219-95e3-bc424a930ab7	59	t	\N	\N	MPYAGQ	2460333334416
84c2bff6-9731-4c89-abd8-2b08d2edfecd	37c9e53a-6e57-430b-8d48-ae594816a367	60	t	\N	\N	EQYSWC	135727891
b263d543-d174-4459-9754-f463e564740b	37c9e53a-6e57-430b-8d48-ae594816a367	40	f	\N	\N	EQYSWC	135727891
a93c25bb-f040-4b01-957b-5512a4f05c0a	4c9281f9-67f4-4051-b45c-9838c8b225b2	51	t	11D	\N	XHUSNB	2460333334417
afbbc9e6-9aa0-4ba7-991b-e212e484c015	c27e8e9f-edef-463f-8c74-0dad4b9964f6	51	t	\N	\N	YDZPSL	135743925
8cff7337-0876-4421-a67a-7d244997a631	d72182d2-d133-415b-90a2-8704c41d36e1	61	t	\N	\N	NZOQNJ	460333334418
c3c3e3c9-858d-43d2-b56a-5249bfa3bf37	62fd4d18-568d-42f3-9bbb-43399e83f3de	62	t	\N	\N	DABAXM	135762614
c0600bd9-e510-44c5-8b4c-aab906469e56	bc8b21f5-c10e-4e81-a9aa-66d80a00c58e	57	t	\N	\N	ZVQVWB	0192463418017
6223590e-bf06-409e-88fc-35aae94d0a78	ee603ba1-7714-4366-8c4a-c5469bfe78f2	63	t	\N	\N	LXOQIZ	0192463418019
68cd42a4-10ce-44fe-8ccf-547c68538950	d7f3b304-8e6e-4d0f-95d2-0be1c8eceb8e	64	t	\N	\N	OVCZMQ	0192463418023
1d135032-d10f-41ec-bb74-43e89a18d7d3	4e65aefb-05ea-4c36-826f-a3b03ec5dfbe	15	t	\N	\N	ITKXDB	135475911
ff43f74e-8ae9-4d6d-abf8-ec50d140ed31	4e65aefb-05ea-4c36-826f-a3b03ec5dfbe	16	f	\N	\N	ITKXDB	135475911
50a77ab4-0dda-4d6f-a84d-8b364649d2dd	e6e76f1d-287b-43a4-b275-1a1402ef46c5	16	t	\N	\N	SMCJAB	0192463344833
e005d5fd-3e8a-4f92-93c3-a98623fccada	4b8eaec3-da05-4ebd-ae33-9d25e0facaa5	65	t	\N	\N	INKNUB	0192463421226
cea4f6b3-57ab-459f-8098-5b092fd08ba3	8279218a-4ca0-44aa-b71a-31241822c5e6	5	t	\N	\N	GYCFOT	2460333334419
33b08e3c-3340-426c-aa60-0ac5e7714aee	3fab42bd-7291-41cc-957f-491f20b2afbc	72	t	\N	\N	BPPQOI	135836627
c3801532-bccd-4b4c-b733-df475f554ed6	8202e81a-97a8-4c0e-bd00-22ae9c713ed9	44	t	\N	\N	KVNYWL	135841113
c24c2572-d0db-48a6-ad14-4c67dd2b443e	e2a9d970-3567-4941-ab5a-884aa2cc3550	73	t	\N	\N	\N	\N
0ff45165-1283-4d06-ba53-e732899faf83	eb966ed6-f559-4a35-81b4-5a6e9138b3e3	73	t	\N	\N	S-001-27297	\N
8a57db03-59da-43fd-b13a-b97b61ca27d7	e99b7a7a-a258-4f88-87b1-c048cd95efa7	73	t	\N	\N	S-001-27297	0000000127297
14e76c2a-7e63-40eb-956a-ecdbb7e9711b	3fa320f5-83ae-4dd3-a53a-09b2a7e2db0b	73	t	\N	\N	\N	\N
4e9beae6-790a-4ad5-9ef8-a1a3f5171f72	b8f43d76-8413-4083-bb41-2c8e91e90d7b	75	t	\N	\N	BCREVG	1342158841869
6b02ab41-8d2d-41f6-88e4-ede6c12f0aaf	8706e8b7-db53-453d-a647-cb48e9cacffa	75	t	26D	\N	BCREVG	1342158841869
9e06ce0f-9534-406b-b397-c65b5b79ef65	47356ef7-3b76-4c50-abd2-d7317046345d	44	t	\N	\N	KVNYWL	135841113
56b691e1-4162-4540-a2cb-90e10de66756	b7c39e56-6fd8-4f9d-a46e-c295e86484e3	75	t	\N	\N	RPLSRW	135881386
b568496f-ebe3-4f8b-8854-07e408ca0ad1	948d3a43-3c94-45b9-ada9-a71fb51af927	79	t	\N	\N	NGTYIK	0192463418045
1ec1e292-9aea-4f19-9433-d151cc399447	cc5feeac-bed3-4ae2-913a-aec7c7aad4c3	78	t	\N	\N	YPGKSM	0192463418046
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permisos (id, modulo, accion, descripcion) FROM stdin;
1	dashboard	view	dashboard - view
2	dashboard	create	dashboard - create
3	dashboard	edit	dashboard - edit
4	dashboard	delete	dashboard - delete
5	sales	view	sales - view
6	sales	create	sales - create
7	sales	edit	sales - edit
8	sales	delete	sales - delete
9	clients	view	clients - view
10	clients	create	clients - create
11	clients	edit	clients - edit
12	clients	delete	clients - delete
13	itineraries	view	itineraries - view
14	itineraries	create	itineraries - create
15	itineraries	edit	itineraries - edit
16	itineraries	delete	itineraries - delete
17	users	view	users - view
18	users	create	users - create
19	users	edit	users - edit
20	users	delete	users - delete
21	config	view	config - view
22	config	create	config - create
23	config	edit	config - edit
24	config	delete	config - delete
25	commissions	view	commissions - view
26	commissions	create	commissions - create
27	commissions	edit	commissions - edit
28	commissions	delete	commissions - delete
29	responsables	view	responsables - view
30	responsables	create	responsables - create
31	responsables	edit	responsables - edit
32	responsables	delete	responsables - delete
\.


--
-- Data for Name: permisos_rol; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permisos_rol (id, rol_id, permiso_id, valor) FROM stdin;
1	1	1	true
2	1	2	true
3	1	3	true
4	1	4	true
5	1	5	true
6	1	6	true
7	1	7	true
8	1	8	true
9	1	9	true
10	1	10	true
11	1	11	true
12	1	12	true
14	1	14	true
15	1	15	true
16	1	16	true
17	1	17	true
18	1	18	true
19	1	19	true
20	1	20	true
21	1	21	true
22	1	22	true
23	1	23	true
24	1	24	true
528	2	13	all
529	2	15	all
530	2	25	false
531	2	26	false
532	2	27	false
533	2	28	false
534	2	21	false
535	2	22	false
536	2	23	false
316	3	1	own
317	3	5	own
318	3	6	true
319	3	7	true
320	3	9	own
321	3	10	true
322	3	11	false
323	3	13	own
324	3	15	true
325	3	25	false
326	3	26	false
327	3	27	false
328	3	28	false
13	1	13	all
517	2	1	own
518	2	5	own
519	2	6	true
520	2	7	own
521	2	9	all
522	2	10	true
523	2	11	all
524	2	29	all
525	2	30	true
526	2	31	all
527	2	32	false
\.


--
-- Data for Name: permisos_usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permisos_usuario (id, usuario_id, permiso_id, permitido, valor) FROM stdin;
14	8	5	t	all
15	8	6	t	false
16	8	7	t	false
17	8	10	t	false
18	8	11	t	false
27	7	22	t	true
28	7	23	t	true
\.


--
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personas (id, nombres, apellidos, tipo_documento_id, documento, email, telefono, birth_date, nacionalidad, avatar_url, status, creado_at, updated_at, deleted_at) FROM stdin;
6	Yulisa	Chavez Valencia	1	1078116644	yulichava85@gmail.com	3216765128	1982-03-15 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Willow	active	2026-06-21 04:14:42.69	\N	\N
41	Mariana 	Castañeda	1	1035012352	ginacanadas@hotmail.com	3205773570	2018-04-02 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Jack	active	2026-06-18 18:31:19.178	2026-06-18 22:10:27.103	\N
39	Jolman Gabriel 	Chaves Ribon 	1	98615751	jolmanchaves1974@gmail.com	3233217085	1974-10-05 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Nala	active	2026-06-18 17:25:20.601	\N	\N
40	Gina	Cañadas	1	53082211	ginacanadas@hotmail.com	3205773570	1989-01-10 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Toby	active	2026-06-18 18:21:07.833	\N	\N
13	Sandis Gabriel	Martinez Ramos	1	98655169	gabrielm198015@gmail.com	3505800077	1980-10-15 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Nala	active	2026-06-10 20:07:08.631	2026-06-17 17:12:01.091	\N
25	Victor 	Alzate 	1	1130668018	victoralzat86@gmail.com	3226730695	1986-09-27 00:00:00	\N	\N	active	2026-06-13 21:51:40.558	2026-06-17 15:52:53.028	\N
51	Jhon Jairo Gutierrez Prettel	Alcalde Litoral Del San Juan	1	11885328	alcaldia@litoraldelsanjuan-choco.gov.co	3128856877	1977-08-25 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver	active	2026-06-30 01:03:17.173	2026-07-01 21:59:31.145	\N
42	Yardanis	 Palacios Cordoba	1	1003970300	danyspalacios45@gmail.com	3226730695	1985-05-15 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Felix	active	2026-06-18 23:39:49.322	2026-06-18 23:54:22.496	\N
43	Everth 	Chiripua Teucama	1	1078666210	chiripuae67@gmail.com	3132528828	1992-06-24 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Casper	active	2026-06-19 21:24:27.938	\N	\N
16	Diego Fernando	Hurtado Mondragon	1	1111801204	gerenciasamtur@gmail.com	50760009494	1993-04-23 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Toby	active	2026-06-10 21:23:10.473	2026-06-10 23:34:29.304	\N
15	Luis Andres	Salas Hurtado	1	1076877088	samturtravel@gmail.com	50760009494	1993-04-23 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Bella	active	2026-06-10 21:16:30.936	2026-06-10 23:34:36.037	\N
52	Faustino 	Ramirez Murillo	1	94320421	tino.murillo@hotmail.com	3142021588	1974-05-09 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Nala	active	2026-07-03 00:56:45.542	\N	\N
49	Diana Cristina 	Cardona Jaramillo	1	43918065	juandanielmartinezcardona@gmail.com	3104483877	1983-09-28 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Maya	active	2026-06-29 22:02:08.841	\N	\N
7	Sebastian Alonso	Mena Chavez	1	1078464852	yulichava85@gmail.com	3216765128	2013-03-18 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Bella	active	2026-06-21 04:17:12.125	\N	\N
8	Cristian 	Hibarguen	1	1078689128	cristianibarguen242@gmail.com	3108349009	1983-07-10 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Casper	active	2026-06-22 22:37:50.445	\N	\N
10	Milton	Olea Tunay	1	1003934286	jairomadrid712@gmail.com	3126424216	1991-06-23 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo	active	2026-06-23 19:01:12.772	2026-06-23 19:01:22.209	\N
11	Juan Carlos 	Zapata Gil	1	71278544	ZAPATAJUANCARLOS632@GMAIL.COM	3216515591	1983-09-26 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Jack	active	2026-06-10 18:30:13.857	\N	\N
9	Loselinio	Velasquez Tegaiza	1	82100111	jairomadrid712@gmail.com	3126424216	1975-06-23 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Felix	active	2026-06-23 18:59:12.808	2026-06-23 21:01:16.532	\N
23	Laura Liliana	Perea	1	1133649145	lauralilianaperea0412@gmail.com	3125272693	1986-06-22 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Jack	active	2026-06-12 17:47:02.999	\N	\N
44	Denio Jimenez Rivas	Alcalde Juradó 	1	94375674	djimenez70@gmail.com	3218386558	1969-06-01 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo	active	2026-06-19 22:06:05.307	2026-07-14 21:47:26.274	\N
17	Jose Luis 	Orejuela	1	16750830	joseluisorejuela68@hotmail.com	3154048904	2026-06-10 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Finn	active	2026-06-10 21:31:49.161	2026-06-12 18:10:28.895	\N
12	Jose David	Zamora	1	1149438427	zamorajosedavid1993@icloud.com	3113626405	1993-04-17 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Toby	active	2026-06-10 19:16:35.239	2026-06-12 18:11:22.881	\N
24	Mayra Patricia	Perea	1	1039459984	mayraperea93@gmail.com	3125272653	1993-05-26 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Maya	active	2026-06-12 18:18:39.39	\N	\N
45	Jose Manuel	Ibarguen Cuenuth	1	1130610341	jose.ibarguen1024@correo.policia.gov.co	3012316848	1986-09-05 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo	active	2026-06-24 00:09:33.71	\N	\N
46	Juan Ramon 	Alzate Castañeda	1	15538040	samturtravel@gmail.com	3103663412	1980-06-11 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka	active	2026-06-24 05:44:00.198	\N	\N
1	Desarrolladores	Itea	1	902062715	admin@itea.com	3013775311	1982-03-19 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Admin	active	2026-05-21 17:17:06.364	2026-06-27 14:55:12.883	\N
21	Pablo Jose	Gonzales Rondon	7	685679	drpablojosegonzalezrondon@gmail.com	3246107166	1983-03-21 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Willow	active	2026-06-10 23:24:30.543	2026-07-14 17:14:51.94	\N
48	Edgar Ivan	Carrera Garcia	1	98387479	samturtravel@gmail.com	3164382158	1966-11-14 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Toby	active	2026-06-26 22:40:43.591	2026-06-26 22:43:53.276	\N
50	Juan Daniel	Martinez Cardona	10	1025897348	juandanielmartinezcardona@gmail.com	3222589422	2012-02-02 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Casper	active	2026-06-29 22:04:12.59	\N	\N
66	Juan	Perez	\N	\N	\N	\N	\N	\N	\N	active	2026-07-22 21:59:33.515	\N	\N
67	Juan	Perez	\N	\N	\N	\N	\N	\N	\N	active	2026-07-22 22:00:52.903	\N	\N
35	Isabella Maria 	Meza Copete	1	1001032019	isabella.meza@udea.edu.co	3217949679	2001-06-04 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Jack	active	2026-06-14 04:10:19.896	\N	\N
36	Claudia Alejandra 	Mosquera	1	1017271108	claudialeja04@hotmail.com	3163401722	2026-06-22 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Willow	active	2026-06-14 18:56:08.598	\N	\N
68	Juan	Perez	\N	\N	\N	\N	\N	\N	\N	active	2026-07-22 22:01:25.234	\N	\N
69	Juan	Perez	\N	\N	\N	\N	\N	\N	\N	active	2026-07-22 22:07:03.579	\N	\N
14	Jhon Alexander	Hinestroza Asprilla	1	12020533	pepokys@gmail.com	3122470884	1983-07-31 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka	active	2026-06-16 16:54:56.529	\N	\N
70	Maria	Lopez	\N	\N	\N	\N	\N	\N	\N	active	2026-07-22 22:43:05.49	\N	\N
71	Jhonny	Palacios Minota	\N	\N	\N	\N	\N	\N	\N	active	2026-07-22 22:49:10.634	\N	\N
5	Angelica	Rivera Garcia	1	35894668	angelikrivera19@gmail.com	3127155144	1982-03-19 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy	active	2026-06-09 23:35:51.342	2026-06-09 23:36:03.467	\N
18	Luis Gonzaga 	Guette Murillo 	1	72003123	luisguette16@gmail.com	3218471792	1997-12-12 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Luna	active	2026-06-17 20:49:54.453	\N	\N
19	Carlos Adolfo 	Donado Cervantes 	1	1143135153	cdonado284@gmail.com	3003789506	1992-07-17 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Toby	active	2026-06-17 20:51:27.705	\N	\N
20	Wilmar Alonso	Arias Alvarez	1	72196866	wilmaralonsoarias21@gmail.com	3182898802	1974-03-21 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Toby	active	2026-06-17 20:53:23.701	\N	\N
54	Maria Isabel	Martinez	1	1038136353	asesorsamtur01@gmail.com	3212357255	1997-08-20 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Casper	active	2026-07-03 18:27:06.304	2026-07-28 21:36:34.288	\N
75	Karen Yoelyz	Mosquera Castillo 	1	1026265880	yoelyz2319@hotmail.com	3146782326	1989-03-19 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver	active	2026-07-29 03:54:38.96	\N	\N
56	Diana Milena	Hernandez Cadavid	1	42690155	diana.hernandez1979@hotmail.com	3113811700	1979-01-02 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Milo	active	2026-07-03 22:04:39.564	\N	\N
55	Leonel Valencia	Alcalde Bsc	1	14252350	jleonel76@hotmail.com	3106830486	1976-01-19 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Nala	active	2026-07-03 21:51:59.854	2026-07-03 21:52:13.511	\N
57	Sadia Lizer 	Palacios Cuesta	1	22449429	sadialiced@gmail.com	3104474105	1968-01-25 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi	active	2026-07-05 22:26:23.233	\N	\N
59	Erick Manuel	Murillo Palacios	1	1025880489	erickman0124@gmail.com	3122959380	2004-07-24 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka	active	2026-07-06 17:53:20.768	\N	\N
76	Paula Andrea	Hoyos Perez	1	1128266279	paodelatex@gmail.com	3244920163	1986-10-05 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Jack	active	2026-07-30 16:12:03.663	\N	\N
60	Ayllin Viviana	Becerra Blandon	1	1036623614	comercial@samturtravel.com	3126339919	2007-05-24 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Felix	active	2026-07-06 22:16:34.812	\N	\N
58	Eduva 	Murillo	1	54259263	eduva_murillo@hotmail.com	3122959380	1974-02-03 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Felix	active	2026-07-06 17:51:16.64	2026-07-07 02:56:23.249	\N
77	Lucas	Rendon Hoyos 	10	1033261674	paodelatex@gmail.com	3244920163	2010-06-28 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Toby	active	2026-07-30 16:18:03.512	\N	\N
78	Elkin Antonio	Palacios Palacios	1	71938414	elkincanton@hotmail.com	3128713342	1967-02-07 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo	active	2026-08-01 18:07:16.931	2026-08-01 18:07:32.065	\N
79	Luz Yacira	Mosquera Murillo	1	1077423712	yazylove1@gmail.com	3127821727	1986-01-08 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi	active	2026-08-01 18:15:16.192	\N	\N
61	Sarita 	Lopez Mena	1	1077996532	saralomena2901@gmail.com	3234989428	2004-01-29 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Jack	active	2026-07-10 03:53:12.263	\N	\N
62	Sindy Lorena	Perez Villegas	1	1038116022	silopevi06@hotmail.com	3104628680	1991-09-06 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Felix	active	2026-07-13 02:59:34.328	\N	\N
63	Maria Teresa	Rivera Mosquera	9	1076337317	kellyjaneth22@hotmail.com	3122969753	2019-05-13 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Willow	active	2026-07-16 14:27:33.085	\N	\N
64	Elizabeth	Beleño Rivera	1	1021397895	elizabeleno.rivera@gmail.com	3001692636	2026-07-12 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy	active	2026-07-16 16:48:14.495	2026-07-16 16:48:31.331	\N
65	Jhonny 	Palacios Minota	1	1152199330	jhonnypalaciosminota@gmail.com	3127160170	1992-07-01 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Luna	active	2026-07-18 17:55:32.207	2026-07-18 17:55:48.384	\N
72	Yeferson Andres	Loaiza Vera	1	1028012415	loaizayeferson9@gmail.com	3235608759	1993-04-21 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Casper	active	2026-07-24 21:42:13.002	\N	\N
73	Juan David 	De Arco Palacio	1	1037624671	juandearco19@gmail.com	3137108858	1993-02-21 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo	active	2026-07-28 21:27:22.417	\N	\N
74	Paula Andrea	Suarez Vargaz	1	1152445121	paulasuarez01@gmail.com	3137109858	1993-03-15 00:00:00	\N	https://api.dicebear.com/7.x/avataaars/svg?seed=Willow	active	2026-07-28 21:29:39.163	\N	\N
\.


--
-- Data for Name: politicas_equipaje; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.politicas_equipaje (id, aerolinea_id, tipo_tarifa, articulo_personal, equipaje_mano, equipaje_bodega, notas) FROM stdin;
3	2	Economy	1 bolso personal	1 maleta de mano hasta 8kg	No incluido	\N
4	2	Premium	1 bolso personal	1 maleta de mano hasta 12kg	1 maleta hasta 23kg	\N
6	14	5kilos personal	5 kilos	10 kilos cabina	15 kilos bodega	el exceso de equipaje tiene un costo adicional segun politica de la aerolinea
9	20	PREFERENCIAL	10KILOS	5KILOS	20KILOS	LOS KILOS ADICIONALES TIENEN UN COSTO
10	3	Basic	1 bolso (43x32x22 cm)	No incluido	No incluido	\N
11	3	Classic / Economy	1 bolso (43x32x22 cm)	1 maleta hasta 10kg (56x36x26 cm)	1 maleta hasta 23kg	\N
12	3	Business	1 bolso personal	1 maleta hasta 10kg	2 maletas hasta 32kg c/u	\N
13	4	Basic Economy	1 bolso (45x35x20 cm)	1 maleta (56x36x23 cm) - En vuelos nacionales	No incluido	\N
14	4	Main Cabin	1 bolso	1 maleta de mano	1 maleta hasta 23kg (rutas internacionales)	\N
15	5	Básica	1 bolso personal	1 maleta hasta 10kg (56x40x25 cm)	No incluido	\N
16	5	Óptima	1 bolso personal	1 maleta hasta 10kg	1 maleta hasta 23kg	\N
17	6	Basic Economy	1 artículo personal	1 maleta de mano	No incluido	\N
18	6	Main Cabin	1 artículo personal	1 maleta de mano	1 maleta hasta 23kg (internacional)	\N
19	7	Basic Economy	1 bolso (43x25x22 cm)	No incluido (excepto vuelos transatlánticos)	No incluido	\N
20	7	Economy	1 bolso	1 maleta de mano	1 maleta hasta 23kg (internacional)	\N
21	8	Light	1 bolso (40x30x15 cm)	1 maleta hasta 12kg (55x35x25 cm)	No incluido	\N
22	8	Standard	1 bolso	1 maleta hasta 12kg	1 maleta hasta 23kg	\N
23	9	Light	1 accesorio pequeño	1 maleta (total máx. 12kg)	No incluido	\N
24	9	Standard	1 accesorio pequeño	1 maleta de mano	1 maleta hasta 23kg	\N
25	10	Blue Basic	1 bolso personal (43x33x20 cm)	1 maleta de mano (a partir de sep 2024)	No incluido	\N
26	10	Blue	1 bolso personal	1 maleta de mano	No incluido	\N
27	11	Standard (Bare Fare)	1 bolso personal (45x35x20 cm)	No incluido (con costo adicional)	No incluido (con costo adicional)	\N
28	12	Go Basic	1 bolso personal (40x30x20 cm)	No incluido	No incluido	\N
29	12	Go Plus	1 bolso personal	1 maleta de mano hasta 12kg (55x45x25 cm)	1 maleta hasta 23kg	\N
31	14	Básica	1 bolso personal	1 equipaje hasta 5kg	1 maleta hasta 15kg	\N
32	16	Economy Special	1 bolso	1 pieza hasta 7kg (55x38x20 cm)	1 maleta hasta 20kg	\N
33	16	Economy Flex	1 bolso	1 pieza hasta 7kg	Hasta 30kg en total	\N
34	17	EcoFly	1 accesorio personal	1 pieza hasta 8kg (55x40x23 cm)	1 maleta hasta 23kg	\N
35	18	Lite	1 accesorio (20x35x30 cm)	1 maleta hasta 10kg (55x35x25 cm)	No incluido	\N
36	18	Standard	1 accesorio	1 maleta hasta 10kg	1 maleta hasta 23kg	\N
39	2	Basic	1 bolso personal (45x35x20 cm)	No incluido (con costo extra)	No incluido	\N
40	2	Light	1 bolso personal	1 maleta hasta 10kg (55x35x25 cm)	No incluido	\N
41	2	Plus	1 bolso personal	1 maleta hasta 10kg	1 maleta hasta 23kg	\N
7	20	LIGERA	5KILOS CABINA	N/A	10 KILOS	LOS KILOS ADICIONALES TIENEN UN COSTO
8	20	ECONOMICA	5KILOS	NA	15KILOS 	LOS KILOS ADICIONALES TIENEN UN COSTO
42	21	BASIC	1 Bolso  Personal  menos de 3 kg 	no incluye equipaje en cabina 	maleta no mayor a 10 kg 	\N
38	1	Classic 	1 articulo personal	1 equipaje de mano (10 kg)	1 equipaje de bodega de hasta 23 kg.	\N
37	1	Basic 	 1 artículo personal debajo del asiento	No incluido	No incluido	\N
2	1	Light 	1 artículo personal	1 equipaje de mano de hasta 10 kg	2 maletas hasta 32kg c/u	\N
1	1	Flex	1 artículo personal	1 equipaje de mano de 10 kg	1 equipaje de bodega de 23 kg	Beneficios de flexibilidad en cambios.
44	1	Business	1 artículo personal	1 equipaje de mano (10 kg)	2 equipajes de bodega de hasta 32 kg cada uno	\N
43	22	No puede exceder los 10 Kg ni las siguientes dimensiones: 45cm x 35cm x 25cm (largo, ancho, alto), incluyendo ruedas, asas y bolsillos.	No puede exceder los 10 Kg ni las siguientes dimensiones: 55cm x 35cm x 25cm (largo, ancho, alto), incluyendo ruedas, asas y bolsillos.	No puede exceder los 10 Kg ni las siguientes dimensiones: 55cm x 35cm x 25cm (largo, ancho, alto), incluyendo ruedas, asas y bolsillos.	Debe pesar hasta 23Kg y no puede exceder los 158cms lineales.	\N
\.


--
-- Data for Name: prod_autos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_autos (id, detalle_venta_id, conductor_nombre, licencia_nro, fecha_recogida, fecha_devolucion, lugar_recogida, categoria_auto, conductores_adicionales, tarjeta_garantia_info, tipo_seguro) FROM stdin;
\.


--
-- Data for Name: prod_checkins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_checkins (id, detalle_venta_id, nro_vuelo_reserva, fecha_viaje, asiento, maletas_contadas, telefono_contacto, necesidades_especiales, usa_silla_ruedas) FROM stdin;
\.


--
-- Data for Name: prod_equipajes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_equipajes (id, detalle_venta_id, aerolinea_id, nro_reserva, pasajero_nombre, tipo_tarifa, articulo_personal, equipaje_mano, equipaje_bodega, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prod_eventos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_eventos (id, detalle_venta_id, organizacion, nombre_contacto, email_contacto, "fechaInicio", "fechaFin", asistencia_estimada, espacio_requerido, tipo_evento, equipos_av, requiere_catering, notas_catering, ciudad, direccion, nombre_lugar) FROM stdin;
\.


--
-- Data for Name: prod_fincas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_fincas (id, detalle_venta_id, responsable_nombre, documento_responsable, fecha_entrada, fecha_salida, adultos_count, ninos_count, tiene_mascotas, tipo_mascota, servicios_extra, ciudad_pueblo, direccion_finca, nombre_finca, observaciones) FROM stdin;
\.


--
-- Data for Name: prod_hoteleria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_hoteleria (id, detalle_venta_id, hotel_nombre, tipo_hotel, destino, nro_reserva, fecha_entrada, fecha_salida, observaciones) FROM stdin;
\.


--
-- Data for Name: prod_mascotas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_mascotas (id, detalle_venta_id, mascota_nombre, especie, raza, peso_kg, "tamanoMascota", transporte_tipo, fecha_viaje, pais_destino, condiciones_medicas, telefono_contacto, empresa_transporte, observaciones) FROM stdin;
\.


--
-- Data for Name: prod_migracion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_migracion (id, detalle_venta_id, tipo_tramite_migratorio, nacionalidad, pasaporte_nro, pasaporte_vence, pais_destino, tipo_documento) FROM stdin;
\.


--
-- Data for Name: prod_pasaportes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_pasaportes (id, detalle_venta_id, nombre_completo, nro_documento, fecha_nacimiento, ciudad_residencia, tipo_tramite, fecha_estimada_viaje, telefono_contacto) FROM stdin;
\.


--
-- Data for Name: prod_planes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_planes (id, detalle_venta_id, "paqueteId", paquete_tarifa_id, nombre_plan, "aerolineaId", nro_reserva, nro_tiquete, fecha_viaje_inicio, fecha_viaje_fin, fecha_salida_vuelo, fecha_regreso_vuelo, adultos_count, menores_count, numero_confirmacion, observaciones, fecha_llegada_regreso_vuelo, fecha_llegada_vuelo, nombre_hotel, nro_vuelo, checkin_status_ida, checkin_status_regreso, tipo_paquete, tipo_transporte) FROM stdin;
5bcab9ff-0b8b-482e-8f22-7547281ef9ef	c00fdbff-eaa5-46ff-b7da-bcc0e708595a	\N	\N	Plan Vacaciones de Junio	\N	\N	\N	\N	\N	\N	\N	2	0	\N	Plan San Andres - Hotel Sol Caribe Centro\n	\N	\N	\N	\N	pendiente	pendiente	supplier	Aéreo
5c7784a1-b9f7-4040-802c-c12f07818da0	e2a9d970-3567-4941-ab5a-884aa2cc3550	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	0	\N	\N	\N	\N	\N	\N	pendiente	pendiente	own	Aéreo
245720a1-56d9-416b-920e-8859c48e1364	eb966ed6-f559-4a35-81b4-5a6e9138b3e3	1	\N	TEMPORADA ALTA ADZ	1	S-001-27297	\N	\N	\N	\N	\N	2	0	\N	Incluye: TIQUTES AEREOS MEDELLIN SAN ANDRES MEDELLIN SALIDA EL DIA 4 DE ENERO AL 8 DE 2007, ICLUYE LA ALIMENTACION FULL, SANKS BAR ABIERTO\nNo Incluye: GASTOS NO ESPECIFICADOS EN EL VOUCHER, ENTRADA A LA ISLA	\N	\N	SOL CARIBE CAMPO	\N	pendiente	pendiente	own	Aéreo
830ae44d-fa14-41fb-9475-456682d3bd1a	3fa320f5-83ae-4dd3-a53a-09b2a7e2db0b	1	\N	TEMPORADA ALTA ADZ	1	\N	\N	\N	\N	\N	\N	2	0	\N	Incluye: TIQUTES AEREOS MEDELLIN SAN ANDRES MEDELLIN SALIDA EL DIA 4 DE ENERO AL 8 DE 2007, ICLUYE LA ALIMENTACION FULL, SANKS BAR ABIERTO\nNo Incluye: GASTOS NO ESPECIFICADOS EN EL VOUCHER, ENTRADA A LA ISLA	\N	\N	SOL CARIBE CAMPO	\N	pendiente	pendiente	own	Aéreo
3e749b1b-6cb3-4914-b757-8b861d4b4795	e99b7a7a-a258-4f88-87b1-c048cd95efa7	1	\N	TEMPORADA ALTA ADZ	1	S-001-27297	0000000127297	2027-01-04 20:00:00	2027-01-08 17:00:00	2027-01-04 15:05:00	2027-01-04 23:25:00	2	0	\N	Incluye: TIQUTES AEREOS MEDELLIN SAN ANDRES MEDELLIN SALIDA EL DIA 4 DE ENERO AL 8 DE 2007, ICLUYE LA ALIMENTACION FULL, SANKS BAR ABIERTO\nNo Incluye: GASTOS NO ESPECIFICADOS EN EL VOUCHER, ENTRADA A LA ISLA	2027-01-09 01:15:00	2027-01-08 17:00:00	SOL CARIBE CAMPO	9348	realizado	pendiente	own	Aéreo
\.


--
-- Data for Name: prod_restaurantes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_restaurantes (id, detalle_venta_id, nombre_reserva, fecha_hora_reserva, personas_count, preferencia_mesa, tipo_menu, restricciones_dieta, ocasion_especial, telefono_contacto) FROM stdin;
\.


--
-- Data for Name: prod_seguros; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_seguros (id, detalle_venta_id, cobertura_usd, dias_cobertura, fecha_inicio_vigencia, fecha_fin_vigencia, telefono_contacto, tipo_seguro) FROM stdin;
\.


--
-- Data for Name: prod_simcards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_simcards (id, detalle_venta_id, pais_destino, fecha_llegada, duracion_viaje, plan_datos, tipo_sim, metodo_entrega) FROM stdin;
\.


--
-- Data for Name: prod_tiqueteria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_tiqueteria (id, detalle_venta_id, "aerolineaId", nro_reserva, nro_vuelo, nro_tiquete, modo_vuelo, "planEquipajeId", checkin_status) FROM stdin;
88289795-770a-41db-bb59-efa71443e0a1	ff8dad0e-bf25-4ac9-9603-1e96994008be	1	BF9PWF	\N	\N	one_way	1	pendiente
02b6cda7-7984-4e73-ad39-efae2ab53082	a4ab0d05-0364-4e66-8928-09df7f788325	20	LIHNLX	\N	\N	one_way	9	pendiente
81579340-95da-4225-9a1f-80876c7dc532	f022e59d-7872-4ecb-86d7-012326df6e57	20	KASVGN	\N	\N	one_way	7	pendiente
d9e867e3-3687-42e6-b9d9-4cc3b293e05d	0e105751-5bcd-4c19-a5a3-dd7e6e3e8703	1	BDVPC4	\N	1342157197451	one_way	1	realizado
dc779add-7bc3-4718-aee9-99b6257fc018	e5e49999-bd1f-4af9-9aa0-083a26fc304e	20	DOZKJM	\N	2460333334401	one_way	8	realizado
d92dad1c-d501-43a9-a515-a2786101fd85	699e62fb-6f51-410d-aaae-386d8c06d02f	20	REBBJA	\N	2460333334402	one_way	7	pendiente
ec452782-48df-47bc-91f7-9d56582090bf	e5d72839-e428-4b1b-8ee7-9971fd98c2a1	20	REBBJA	\N	2460333334403	one_way	7	pendiente
cbd39029-a286-431a-8589-25f48bdd3c46	d59b825f-ab83-4e72-8253-73685d774fc3	1	BN3VQK	\N	1342156938471	one_way	\N	pendiente
cf2cb956-d807-4972-a8d5-25959b666635	deeacbe5-03f5-48c7-a6f1-5d29694e0430	1	ATXBPK	\N	\N	one_way	1	pendiente
d34a28ff-7b20-4194-a29c-5bb643e78476	07ffe0e9-18fd-49fc-8ade-f31f8dfe3378	1	BN3VQK	\N	\N	one_way	1	pendiente
6b3a34cd-828b-4e33-ac49-e218e9147a77	4180954d-17d9-4b53-ad0a-275b34b9dac6	20	LNAJFF	\N	\N	round_trip	7	pendiente
6d377825-9213-45d2-8680-2b2c67b16b91	ceb44ab2-69f0-4cf4-bac9-73bb3cc9affc	20	KAGUGA	\N	\N	one_way	9	pendiente
ee39ef28-2af4-40c2-b85a-608b05bae61f	fd547479-723b-4a91-abea-518563a9238c	1	ABXD5I	\N	\N	one_way	2	pendiente
64651cbf-db38-4268-aafd-ee7d9e28be08	4b2f7379-34f7-45e6-9101-2aa187987049	1	AV9531	\N	\N	one_way	2	pendiente
2a9b4955-7ccc-43e0-aa4a-0e978b1d0292	9824a76d-4ea3-4205-b6bb-7dbb84a3d9fb	1	AV9531	\N	\N	one_way	2	pendiente
de386459-0ad5-4525-b18d-be6c9cfeed5e	38ae1568-5ed0-42c1-a2af-047bf61ca2b4	14	HUWEPN	\N	\N	one_way	31	pendiente
3fd5a3f2-9480-4160-82b6-ce75539bf9b1	bc583ec7-c007-4236-8d14-1ecf1a627fef	20	XHMUQS	\N	\N	one_way	8	pendiente
6ae4cae1-d26d-469c-a4d6-88f7854ff90e	cf517aae-1be5-4949-b6d5-ef51614b5e89	20	VARBJJ	\N	\N	one_way	8	pendiente
48093ab9-a3ad-4cd1-8dd9-85d4702287b6	e1ac8d9e-9efc-41a8-b6f2-8a85dd472fe6	20	YFQDVS	\N	\N	one_way	7	pendiente
43e5e990-6b89-4983-b839-b2069ad713af	2a07304c-c890-456e-940a-11487e9f1465	14	OQGBFW	\N	\N	one_way	31	pendiente
c433b6f6-1c16-433a-940f-fca88ce5b6d4	31b21b7b-cded-4756-93d5-e85d1e0efb62	20	BXNRTQ	\N	\N	one_way	7	pendiente
e410f6aa-d981-4823-8cfa-79f54763179d	cb25ec65-08aa-4ed9-bf4e-8cb6c5ee5260	20	LMKHIO	\N	\N	one_way	7	pendiente
abd7414d-410a-4a01-b02f-b946547dd89d	0460bbac-5ebb-441a-870f-0019dcdf3d81	14	BSTLOZ	\N	\N	one_way	31	pendiente
c4fff3f5-e53d-442c-a010-930051ad74b1	5167b692-0ded-43c5-aee3-a41535e656b1	20	CRIMWF	\N	\N	one_way	7	pendiente
08b0540b-5804-4ce5-90f4-dc75c582e9a6	9e57d3ca-a0a9-4ac8-9c2a-b564d0aafc8d	20	CRIMWF	\N	\N	one_way	7	pendiente
4223ba98-60e8-4f42-afc5-e6222e430f08	9fe77905-ed72-4e4c-a0a2-e6665f4f874e	20	PUQFBC	\N	\N	one_way	9	pendiente
5146a1a5-4e1f-4817-b73d-3bbdbce7423f	5b61785d-8c5a-431e-8491-11838e518ba5	20	WHUBQS	\N	\N	round_trip	\N	pendiente
cd8c27bb-caf2-45de-8315-f9d4b5933716	48bf7c17-babb-4da4-a42d-2b9a397664ae	20	NEXUEO	\N	\N	one_way	\N	pendiente
fb1ebab6-2e91-4b29-82a3-f901a0805773	ab8c0c6c-2f42-4259-83f5-a28e19acd9ef	20	CRVPWY	\N	\N	one_way	\N	pendiente
e20fc50d-74c6-45c8-ac3e-fa679f401dbc	14509d4b-184a-4c06-a7e3-dd9621243582	20	CIYIHX	\N	\N	one_way	\N	pendiente
5108b30c-0c32-4f6b-b682-9a6e2f6cdce8	78caad25-7c9f-452e-a856-30966c6196da	1	CZ8YJ9	\N	\N	one_way	\N	pendiente
afb3207a-b218-4574-91f2-a61d638d0d6a	4a208974-2b1b-46a7-a6c9-589ad8460638	14	ZAZRYR	\N	\N	one_way	\N	pendiente
c65ab47d-2377-4a7c-99f3-4f13eb441178	c203d8f7-3fd4-4776-9942-e31231f8476e	1	BK77S6	\N	\N	one_way	\N	pendiente
aec7074d-d63d-4382-bc7a-d167c4c32952	49427b3f-a03e-4e42-8a57-ec5014b71724	1	CFMTWA	\N	\N	one_way	\N	pendiente
d0611c31-a1f9-4351-8d2f-9fa167000448	4d9fe61e-3ac4-47ae-8dd8-9bf4b3a72719	21	3ZJ9PA	\N	\N	one_way	\N	pendiente
3abf52d2-92f6-4f5c-abe7-005455c0c7e9	f1b6cc8f-8c8b-445c-837b-1baa2754da32	14	XFFDRM	\N	\N	round_trip	\N	pendiente
e7af4682-6704-45d9-a9dd-415484872b70	9afcb13f-a90b-4da2-b47d-781a65e474d2	14	BASHNZ	\N	\N	round_trip	\N	pendiente
555ce73e-9446-4f1d-a196-d01d067e5999	a6c0f797-285d-4cc9-ad99-79d25e0dc2a3	14	ODKPOD	\N	\N	round_trip	\N	pendiente
3fdd22d3-aff4-450f-8919-0a5aa31c54ae	fc5e1cbd-df68-4643-99ac-a0390a1dec56	21	D7IU56	\N	\N	round_trip	\N	pendiente
f15e29ae-3515-4087-bb78-4796bbe43c5e	c58bc837-f601-4944-bfa6-85fe4c240288	20	TQAFED	\N	\N	one_way	\N	pendiente
ff7cb94e-8d86-4b03-874a-7af3774c876d	7b85c17a-c123-4f9c-bf8a-0f841f9bd47f	2	LA0351	\N	\N	one_way	\N	pendiente
ef9bcaba-17f0-4ed0-a3e7-dc20e91581b0	44919fbf-fdff-4879-b7ee-d50576631f4c	1	C32F9P	\N	\N	one_way	\N	pendiente
8b565a94-d534-4abb-9429-d70beef2d7d2	bc9a3854-0e58-454a-a8bf-46b269f29d85	1	C32F9P	\N	\N	one_way	\N	pendiente
1f9fd65f-29a5-435f-85a4-dd8bfb3c23d8	c77f5949-279d-48bd-84af-c87739af2f29	20	VLVFSF	\N	\N	one_way	\N	pendiente
aeb74c2d-e4e5-46d5-bda5-68e4a6777d5c	406bc393-fb2b-4219-95e3-bc424a930ab7	20	MPYAGQ	\N	\N	one_way	\N	pendiente
7d0f00de-c8dc-44d6-a2c3-1a5d0367d136	37c9e53a-6e57-430b-8d48-ae594816a367	14	EQYSWC	\N	\N	one_way	\N	pendiente
4c37ab23-6dcc-493d-b47d-e1fe4b80c83f	4c9281f9-67f4-4051-b45c-9838c8b225b2	20	XHUSNB	\N	\N	one_way	\N	pendiente
9869a684-6833-4793-91ba-22ee42ffe9cf	c27e8e9f-edef-463f-8c74-0dad4b9964f6	2	YDZPSL	\N	\N	one_way	\N	pendiente
b150b63c-233b-4a58-957b-dfd6cd485ed5	d72182d2-d133-415b-90a2-8704c41d36e1	20	NZOQNJ	\N	\N	one_way	\N	pendiente
e19bbb5e-4542-4464-9789-957dbb1d4070	62fd4d18-568d-42f3-9bbb-43399e83f3de	20	DABAXM	\N	\N	round_trip	\N	pendiente
d07b5520-5a7f-4280-a8b4-822fdb7d23c0	bc8b21f5-c10e-4e81-a9aa-66d80a00c58e	14	ZVQVWB	\N	\N	one_way	\N	pendiente
da712178-7e5d-4aff-a5ad-bbf73b180ede	ee603ba1-7714-4366-8c4a-c5469bfe78f2	14	LXOQIZ	\N	\N	one_way	\N	pendiente
e82287f4-7498-4eca-925e-ffd05e7512f1	d7f3b304-8e6e-4d0f-95d2-0be1c8eceb8e	14	OVCZMQ	\N	\N	one_way	\N	pendiente
97a6fb3c-5bbd-4018-827f-eb12a2aebefa	4e65aefb-05ea-4c36-826f-a3b03ec5dfbe	14	ITKXDB	\N	\N	one_way	\N	pendiente
9bca864b-3724-401e-bfb3-f86e6f82f80f	e6e76f1d-287b-43a4-b275-1a1402ef46c5	14	SMCJAB	\N	\N	one_way	\N	pendiente
cbab4932-d4d5-44cf-a59c-7a9af8535748	4b8eaec3-da05-4ebd-ae33-9d25e0facaa5	14	INKNUB	\N	\N	one_way	\N	pendiente
e4edfc1c-49ab-4885-baa6-af7f031e8ee9	8279218a-4ca0-44aa-b71a-31241822c5e6	20	GYCFOT	\N	\N	one_way	\N	pendiente
fdf7937e-e16a-4e2c-bb09-648d5d62c608	3fab42bd-7291-41cc-957f-491f20b2afbc	3	BPPQOI	\N	\N	round_trip	\N	pendiente
24c241c3-e3cd-4f95-ad58-9387560ba2a6	8202e81a-97a8-4c0e-bd00-22ae9c713ed9	1	KVNYWL	\N	\N	one_way	\N	pendiente
0e5fb0bc-ea55-4744-bcf5-5295a2cf0f71	b8f43d76-8413-4083-bb41-2c8e91e90d7b	1	BCREVG	\N	\N	one_way	\N	pendiente
d5236aec-5664-49f8-9c74-6de1a1ee9747	8706e8b7-db53-453d-a647-cb48e9cacffa	1	BCREVG	\N	\N	one_way	\N	pendiente
a4532df7-a4e1-4a7a-8073-36f205df04c8	47356ef7-3b76-4c50-abd2-d7317046345d	1	KVNYWL	\N	\N	one_way	\N	pendiente
de94758d-3bed-41b1-ac9f-b71ad91be0b5	b7c39e56-6fd8-4f9d-a46e-c295e86484e3	14	RPLSRW	\N	\N	one_way	\N	pendiente
57c88441-c6fc-456b-903b-426cdec7336e	948d3a43-3c94-45b9-ada9-a71fb51af927	14	NGTYIK	\N	\N	one_way	\N	pendiente
aed05cf9-fdad-4917-8d02-0478d287bfd9	cc5feeac-bed3-4ae2-913a-aec7c7aad4c3	14	YPGKSM	\N	\N	one_way	\N	pendiente
\.


--
-- Data for Name: prod_tours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_tours (id, detalle_venta_id, tour_nombre, fecha_preferida, adultos_count, menores_count, edades_menores, idioma_guia, requiere_transporte, punto_encuentro, condiciones_medicas, telefono_contacto, observaciones) FROM stdin;
\.


--
-- Data for Name: prod_visas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prod_visas (id, detalle_venta_id, nombre_completo, fecha_nacimiento, nacionalidad, nro_pasaporte, vencimiento_pasaporte, pais_aplicacion, tipo_visa, fecha_estimada_viaje, email_contacto, tipo_documento) FROM stdin;
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proveedores (id, nombre, tipo, email_contacto, telefono, web, status, observaciones) FROM stdin;
25	VIAJES VIASSA 	Operador	ejecutiva10@viassa.co	3157168081	https://viajesviassa.com/destinos/	active	EXPERTOS EN QUINCEAÑERAS NACIONAL
8	AVIANCA LIFE MILE	Aerolinea	servicioavianca@avianca.com	1-888-927-7250	https://www.avianca.com	active	\N
9	CLIC KIU	Aerolinea	JUAN.SANCHEZ@CLICAIR.CO	3124704565	https://clicair.co/	active	\N
10	Avianca Web	Aerolinea	servicioavianca@avianca.com	+57 01 800 0183 098	https://www.avianca.com/es/sobre-nosotros/contactanos/	active	\N
12	VDT	Operador	info@grupovdt.co	601 508 6259	https://www.grupovdt.co/wtc/co/informacion/contacto.aspx	active	\N
21	Grupo Welcome 	Operador	servicioalcliente@grupowelcome.com.co	3203703750	https://grupowelcome.com.co/contacto	active	Mayoristas en san andres y quinceañeras nacionales
11	Price Agencies Colombia	Consolidadores	afiliaciones@priceagencies.co	601 743 0100	https://www.priceagencies.co/	active	\N
28	MOON	Aerolinea	gestionhumana@moonflights.com.co	+57 (314) 373-0865	https://moonflights.com.co/	active	AEROLINEA REGIONAL
13	Hotel Do	Consolidadores	servicecenter@hoteldo.com	01 800 5190253	https://www.hoteldo.com/	active	\N
17	Orion Group	Operador	servicioalcliente@oriongroupmayorista.com	3213691088	https://oriongroupmayorista.com/	active	\N
18	Checkin One 	Operador	Reservascheckinone@gmail.com	312 751 0627	https://www.checkinone.com.co/	active	\N
14	Akira Travel	Operador Internacional	contacto@akiratravel.com	+57 300 912 1333	https://akiratravel.com/	active	\N
29	LATAM WEB	Aerolinea		6015185800	https://www.latamairlines.com/co/es	active	Aerolinea LATAM WEB
27	Infinity Travel	Operador	info@infinitytravel.com.co	(604) 3220100	https://infinitytravel.com.co/	active	Fuerte en Norcasia, Magüipi, Tatacoa, Santa Marta, Santander, San Andres, Sur de Colombia, Boyacá, Eje Cafetero\nCuenta Bancaria: Bancolombia - Ahorros - 23600024086
26	TuReserva.com	Operador Internacional		3124652830	https://www.tureserva.com.co/	active	Hoteles internacionales, el Dreams Karibana en Cartagena, USA, Mexico, Europa, Asia
1	VIAJES COLOMBIA ONLINE	Operador	aliados@viajescolombiaonline.com	3128751589	https://www.viajescolombiaonline.com.co	active	\N
22	SATENA KIU	Aerolinea	reserva@satenamedellin.com	3104690564 	https://www.satena.com	active	\N
23	MAYOR PLUS	Consolidadores	comercial1@mayorplus.com	3176686186	https://mayorplus.com	active	\N
24	LC TURISMO	Operador Internacional	comercial@lcturismo.com.co	3016965071-3105104460-6043113161-3128506774	https://www.lcturismo.com.co/	active	\N
16	Alana tours	Operador Internacional	gineth@alanatours.com	+57 323 357 9356-3226635553	https://alanatours.com/	active	\N
19	IberoLuna 	Operador Internacional	europamundo1@iberolunatravel.com	313 4002853	https://www.iberolunatravel.com/	active	\N
20	Assist One	Operador	comercial@assist1.com.co	(601) 381-0654	https://agencias.assist1.com.co/	active	\N
30	Viajes La Corona	Operador Internacional	comercial@viajeslacorona.com	3122989595	https://www.viajeslacorona.com/	active	NIT 901432441-7\n
31	Hoteles y Destino	Operador Internacional		573216086824	https://www.hotelesydestinos.com/	active	NIT 901065681-3
32	Satena Web	Operador	cliente@satena.com.	3233220006	https://www.satena.com/es	active	NIT 899999143-4
\.


--
-- Data for Name: responsables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.responsables (id, persona_id, status, creado_at, deleted_at) FROM stdin;
1	13	active	2026-06-18 22:48:12.93	\N
2	25	active	2026-06-18 23:27:22.834	\N
5	55	active	2026-07-05 06:41:50.637	\N
4	51	active	2026-06-30 01:03:17.295	\N
3	44	active	2026-06-19 22:06:05.435	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, nombre, descripcion) FROM stdin;
1	admin	Administrador del sistema
2	asesor	Asesor de ventas
3	freelancer	Vendedor independiente
\.


--
-- Data for Name: sesiones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sesiones (id, usuario_id, token_hash, expires_at, creado_at, user_agent) FROM stdin;
51183db6-cfea-4456-98ab-5603cece95d2	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTExMzYyNiwiZXhwIjoxNzgxMjAwMDI2fQ.0WnP0ehZW4xIAojB6XMXVAMkMMZOqGQmHZTbStAbmUA	2026-06-10 18:17:06.682	2026-06-10 17:47:06.689	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
ce6bd9e5-c6ee-4d45-94c7-3fe5e26dd140	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTExNTU4MSwiZXhwIjoxNzgxMjAxOTgxfQ.DsBtlMPDziVX9P4o4HDuU2Rw1j0Br2uHOYur530HWRo	2026-06-10 18:49:41.335	2026-06-10 18:19:41.336	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
58420a34-b46b-41da-be16-55794f1e487d	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIwODUzNCwiZXhwIjoxNzgxMjk0OTM0fQ.Ue4LQn7dq1vlyYZEWnpOZpAbsH4c2Hf7JEvHL29fGRw	2026-06-11 20:38:54.586	2026-06-11 20:08:54.588	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
72480c69-7735-4bfe-94fe-f29a6c37eb64	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIwOTAxMywiZXhwIjoxNzgxMjk1NDEzfQ.wf4UzSx-V08gUB431q6Wvuf9Ihl51ySVItQpzHxemic	2026-06-11 20:46:53.486	2026-06-11 20:16:53.487	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
d213da3e-3c8f-4076-a8ad-2bffb5c75e84	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIwOTY5MCwiZXhwIjoxNzgxMjk2MDkwfQ.QvXavGcQ_VvUD9pb5RdW4P05uYaw6ekpO12_Xh7bev8	2026-06-11 20:58:10.795	2026-06-11 20:28:10.796	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
0cf502c5-e453-4323-8947-2c2edfa66702	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIxMDA4MCwiZXhwIjoxNzgxMjk2NDgwfQ.rROjDVaxVMSXIXbkqNaXgct7l2uGcY2kFbL-fpmMI7E	2026-06-11 21:04:40.555	2026-06-11 20:34:40.59	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
da441d97-631a-4c70-b0d9-2cf7bd0f2ac9	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIxMzIzOCwiZXhwIjoxNzgxMjk5NjM4fQ.V01z_DsYem_dEoXR78Hoe_Tbf1QKkrbVoacgiiI0bEA	2026-06-11 21:57:18.601	2026-06-11 21:27:18.602	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
3fe5fbf8-8fc2-49b2-963a-2c8fefbe1a79	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIxNDA0NiwiZXhwIjoxNzgxMzAwNDQ2fQ.UbFHRHVyMvuCl6YYTR3Deya2LKaeZBs3VVR464Rt1xQ	2026-06-11 22:10:46.505	2026-06-11 21:40:46.591	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
88a3f585-d9c8-42bc-a40b-826c995323cc	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIxNDg4NiwiZXhwIjoxNzgxMzAxMjg2fQ.zYCbdTV5j2jhkVW1HqB9xZ1MNSA15WsVmX468ydizJc	2026-06-11 22:24:46.596	2026-06-11 21:54:46.597	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
f78d49a1-8520-4175-b59d-9da9b0d26cdb	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIxNzg0NCwiZXhwIjoxNzgxMzA0MjQ0fQ.nnWD9ZtQQTKs5PoKF9pas1oMERmfEj00aZpxdMIRNRM	2026-06-11 23:14:04.363	2026-06-11 22:44:04.364	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
6330d273-6ade-4dcb-b673-6dc1e7d95d28	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIzMTE5NywiZXhwIjoxNzgxMzE3NTk3fQ.dfEYvwsz0EWN9gniSCOJPztr4LKXXObNzO7ooRao4Fs	2026-06-12 02:56:37.728	2026-06-12 02:26:37.729	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
c3133fe6-d71d-4087-a3c1-d06b850030f7	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIzMjAzOSwiZXhwIjoxNzgxMzE4NDM5fQ.abAahUYG0vj3i-R0GoAoOD5WAtigpimpnu5j0uw0f0Y	2026-06-12 03:10:39.632	2026-06-12 02:40:39.632	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
0638a185-a14f-4f90-92d4-f4c3e31c8792	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTIzMzA4MCwiZXhwIjoxNzgxMzE5NDgwfQ.B-FnlO6IZCiYrM2uUeC098d6hokPD9t0MvUB8StTa2I	2026-06-12 03:28:00.236	2026-06-12 02:58:00.237	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15
4126e052-df51-41fe-9cbf-f8a7126b1f80	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTI3ODk1NywiZXhwIjoxNzgxMzY1MzU3fQ.9Mf3lYRuU3vlFRcvJ0RzU3ZMjExUCE7NnV4B_WYhgG4	2026-06-12 16:12:37.758	2026-06-12 15:42:37.775	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
eddc3217-0dd6-4ac3-b025-1e5fc868dd34	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTI4MzgwNiwiZXhwIjoxNzgxMzcwMjA2fQ.I4iVjhtGRD1aBezPNCByGdsUYaFXvZaVn8vnihxCUAM	2026-06-12 17:33:26.222	2026-06-12 17:03:26.228	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
3b9da069-561d-4182-b0cb-8834946ba239	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTI5NDU3NSwiZXhwIjoxNzgxMzgwOTc1fQ.EKkpKXF_ew95w2eQp_xFLGpfiFnQ0Xgd6e6IrYuGF_s	2026-06-12 20:32:55.566	2026-06-12 20:02:55.569	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
0c5ff364-2516-4b0f-8c32-4cf178dbeb4e	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTI5NTYzOSwiZXhwIjoxNzgxMzgyMDM5fQ.y6a0JarIPOIxq9ffLDnBblv3PFSMTZ-e5YpRyCpfyN4	2026-06-12 20:50:39.947	2026-06-12 20:20:39.949	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
7ed2d737-97e5-43a7-b982-7195c076ea74	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTI5ODc4NSwiZXhwIjoxNzgxMzg1MTg1fQ.TMKEMEtzm3rwTn_nv_vrb8vv5NyApP17FDMA_Jzu-G4	2026-06-12 21:43:05.926	2026-06-12 21:13:05.928	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
39062157-a885-4618-a2ed-9a51a31078d2	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTMwMjQzMCwiZXhwIjoxNzgxMzg4ODMwfQ.Wm3UAccu8USBfb5Wai43435RSBVO329IEX4KMPFy9KQ	2026-06-12 22:43:50.047	2026-06-12 22:13:50.049	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
837fb096-d850-42f4-919d-ea4e36d5e94c	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTMwOTk4NCwiZXhwIjoxNzgxMzk2Mzg0fQ.HpoEea_y2NDnSk8ZisGk7v5Py7DU_Ex-XqTaR6usPzs	2026-06-13 00:49:44.294	2026-06-13 00:19:44.297	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
9b02eda7-8274-4479-ba5d-2e301622bc74	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTMyMTQyMiwiZXhwIjoxNzgxNDA3ODIyfQ.8IuWHoXhgbdjOIwFWzkMpJ-76_uftFGpEh7pDxf92IA	2026-06-13 04:00:22.38	2026-06-13 03:30:22.381	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
989aa90f-d22a-434a-9a61-259b6d9c2a2e	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTMyMTgzNiwiZXhwIjoxNzgxNDA4MjM2fQ.xRC8vdlB__iC4Xl29JucSGyZiGGxZ8aqzEd9goCyj-o	2026-06-13 04:07:16.078	2026-06-13 03:37:16.078	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
740aa939-9bb2-45bd-a17e-92a603ac73bb	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTM4NDY3OCwiZXhwIjoxNzgxNDcxMDc4fQ.DyZSwybp_yCI-uFNq-NxO7y4v705ypbdoPd1LG8QkiU	2026-06-13 21:34:38.867	2026-06-13 21:04:38.868	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
8f6ced3d-7b05-48cd-b27c-cf7567612eef	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTQ2NjQ4NiwiZXhwIjoxNzgxNTUyODg2fQ.0E28jrFriFchLoLDXRpCSfw6m9puLQ8YMn2bScBIVAY	2026-06-14 20:18:06.716	2026-06-14 19:48:06.717	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
38c31507-87e3-4fa0-b26b-0f1e256af000	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTQ2Njc5NCwiZXhwIjoxNzgxNTUzMTk0fQ.N_I5dPgtVhKRaXSwsXvtCArGFaVSPlL3P6ajbtdFyOI	2026-06-14 20:23:14.304	2026-06-14 19:53:14.305	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
6606afec-205f-46ee-9f79-5ac6791ed373	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTQ2NzE0NiwiZXhwIjoxNzgxNTUzNTQ2fQ.6d4js5wgXE0-zE4QXvJ6J6nZuglCY8D65CG2msj7ECk	2026-06-14 20:29:06.852	2026-06-14 19:59:06.873	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
4266c61d-61e3-4ce0-a0a7-9f8cef8cff6d	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTQ2ODY5NCwiZXhwIjoxNzgxNTU1MDk0fQ.gfcsB1oy9rP6Mjp24rY9mN-o5JYRMk1jCw3bf8cwuSY	2026-06-14 20:54:54.988	2026-06-14 20:24:54.996	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
15a900b4-a59e-4296-81de-925899a1012a	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTQ5MjY0MiwiZXhwIjoxNzgxNTc5MDQyfQ.W6MqOl96qM3-0qEWgsf2tL27-Met59ZM2YEnYoqQ928	2026-06-15 03:34:02.405	2026-06-15 03:04:02.407	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
670da495-23df-4291-a8df-2928b3252062	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTU4NDU0NiwiZXhwIjoxNzgxNjcwOTQ2fQ.cGbqLYHLX6z4dWy2H3OGW5WtBfx1pdGvOiQfseUg6mA	2026-06-16 05:05:46.584	2026-06-16 04:35:46.585	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
dbc8ff0b-d5cc-49a7-b80b-3a55207ba4bd	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTYyODYxNCwiZXhwIjoxNzgxNzE1MDE0fQ.AuJBVOYoYhJzo9HB1vYSM9nJUg4miO9WDgjpqDLuvKc	2026-06-16 17:20:14.664	2026-06-16 16:50:14.666	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
c6097efc-21df-47c5-9786-7d529fb1c769	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTY1MTA4MywiZXhwIjoxNzgxNzM3NDgzfQ.F74Kd9Y0v_w2OfCXRpWY4Pji5lEloIjaF9SWiVgsu58	2026-06-16 23:34:43.555	2026-06-16 23:04:43.556	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
95fa02b1-c0a8-4e0f-8ccc-5aec7f307456	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTY1MTEyMywiZXhwIjoxNzgxNzM3NTIzfQ.UIvPNcPIKai-jiB38sOOzQT_kBh8yp0ho3k6scrDfBQ	2026-06-16 23:35:23.059	2026-06-16 23:05:23.06	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
c816c197-61b1-4d8c-b4b2-3d2529cb396f	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTY1MTEzNiwiZXhwIjoxNzgxNzM3NTM2fQ.0cAHrbVXIiwySqVgOdL4Y3ZDsClIjZmKCCsRhOroezM	2026-06-16 23:35:36.764	2026-06-16 23:05:36.765	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
0bc944b7-6bbd-4370-ab1f-14c41421c755	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTY2MDQ5MywiZXhwIjoxNzgxNzQ2ODkzfQ.eUApr1-aM1PifdLNRmDnrN1clXrV0H1XRgk9ZNzcscc	2026-06-17 02:11:33.794	2026-06-17 01:41:33.795	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
d2f1c43c-4bef-4435-bee4-6c9ca2d5a261	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTY3MDAwNCwiZXhwIjoxNzgxNzU2NDA0fQ.Kddf-OvP_RvcSSd36IxHSczC64ZbSgPLcZbr5Arni7g	2026-06-17 04:50:04.617	2026-06-17 04:20:04.618	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
37143400-e78c-4e11-bdcc-c39aad34782c	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTcxMTMzMCwiZXhwIjoxNzgxNzk3NzMwfQ.cr0Wd1pLcTm8MrIm3bGB3eIiMDBLE_rSd8KaI5FWoLY	2026-06-17 16:18:50.732	2026-06-17 15:48:50.733	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
7ad3cda9-7831-48a2-ad19-0d63ff895dbd	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTcxNDQ4MCwiZXhwIjoxNzgxODAwODgwfQ.NHivi2NeJ0PBq1BigRiGy1ldlenhjWtqsVGLSO0SRiQ	2026-06-17 17:11:20.42	2026-06-17 16:41:20.421	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
d1749f52-0136-47ca-98cd-2e0a256807ef	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTcxNTM0NiwiZXhwIjoxNzgxODAxNzQ2fQ.0ezcdr_6d25EKmOQ9wSid2Pb6Nh73rQrHiNm_dRAyLw	2026-06-17 17:25:46.616	2026-06-17 16:55:46.617	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
da074e57-0085-40e7-8177-056687a5f3e5	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc0MzY3NSwiZXhwIjoxNzgxODMwMDc1fQ.Az9jKrspyFy8F5MRuj3YRoBISApOM9qf1wtoAfZaVDg	2026-06-18 01:17:55.826	2026-06-18 00:47:55.827	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
789cc762-050c-4673-a5fc-0c21fd4eeb98	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc0NTQ1NiwiZXhwIjoxNzgxODMxODU2fQ.snVtfwUAyFe8yGor_HyqXRidLKPv6epcXRlfnZcsUE8	2026-06-18 01:47:36.387	2026-06-18 01:17:36.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
eb547497-abbe-4642-9664-2547f5858772	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc1MjM5MywiZXhwIjoxNzgxODM4NzkzfQ.ytZd3Oz8UkURbeKAG4kNZeF7xeOeOBUZYXHOhHkLPo0	2026-06-18 03:43:13.3	2026-06-18 03:13:13.303	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
a595fd95-38b5-4991-b07c-baf6bd515224	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc1MzU2NiwiZXhwIjoxNzgxODM5OTY2fQ.TvUw8x70J6K2NI0XGqS6pQB7v-2vqYU9XR_5yLCwGNM	2026-06-18 04:02:46.887	2026-06-18 03:32:46.891	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
991f86e5-5b8a-4131-89ec-c0848804fde1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc1NTQ3OSwiZXhwIjoxNzgxODQxODc5fQ.1TSP-W6xSytJJXeW7qP5Fykd8eJgj5pNKel2PS77hMA	2026-06-18 04:34:39.876	2026-06-18 04:04:39.877	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
7907ddf2-3b08-4d7e-ada7-9bdeb6a7f81d	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTc1NTc3MiwiZXhwIjoxNzgxODQyMTcyfQ.LGHs1o0rRYwwu-hGkzWrnlwnzPTHS8rU6qaAhXIRWhg	2026-06-18 04:39:32.216	2026-06-18 04:09:32.222	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
89b2d784-3e96-46dc-b297-6b82083d1bc1	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgwMzA0OSwiZXhwIjoxNzgxODg5NDQ5fQ.MUV75M5h0wEHw2Rroa_APNX54npnI2MLurR2-S0wnak	2026-06-18 17:47:29.501	2026-06-18 17:17:29.502	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
13f0d3bd-671f-4c23-a485-87ccc1d38673	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgwNTU3MywiZXhwIjoxNzgxODkxOTczfQ.zoiW69-pOwmY_0nJZGFK-Yxavw4kdnZ4a9Z_KWehkI4	2026-06-18 18:29:33.157	2026-06-18 17:59:33.163	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
2538818c-ba86-44a3-902e-af9d30edce8c	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgwNjIzMSwiZXhwIjoxNzgxODkyNjMxfQ.6rhH8LZQ8B07JOA4skXF8bbY50cA_KtSou6OUKVD0cA	2026-06-18 18:40:31.933	2026-06-18 18:10:31.936	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
469f9d71-cdf1-449f-b92c-93dc2cd8909d	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgwNjQ4MCwiZXhwIjoxNzgxODkyODgwfQ.HUznC0gYBzRB4ZSdtcdcm6uRVUzMawZX_fCUD-k6hcw	2026-06-18 18:44:40.573	2026-06-18 18:14:40.586	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
b9ba5633-0dd1-4dee-87f1-6523fff9efc1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgwNjU1MywiZXhwIjoxNzgxODkyOTUzfQ.7Dsi2lE_ZrT_lb-MWyCoAYY38tRn7565p1bsEANQ1kk	2026-06-18 18:45:53.561	2026-06-18 18:15:53.564	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
066ec6e4-fa44-4b7b-96d7-4f9501a3a750	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgwNjU5MywiZXhwIjoxNzgxODkyOTkzfQ.9ssfWIWXgsWnIr01vbwV5OiHzCDJ6CSsa5yxhmuGuKY	2026-06-18 18:46:33.2	2026-06-18 18:16:33.201	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
a2301463-410c-4680-8e42-8804d9aaab94	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgxNzEzMywiZXhwIjoxNzgxOTAzNTMzfQ.jBKusv70PgJwOdZlNfZJayFBtbURGjzBiCCnLn0XDDo	2026-06-18 21:42:13.097	2026-06-18 21:12:13.098	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
0d0c8fab-e08d-417a-8976-845999c9c3fe	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgyMDgzNiwiZXhwIjoxNzgxOTA3MjM2fQ.SYgmZ73FgLofxRm1MlTI4l9TcNzT-OF1mkxDo1pBvWE	2026-06-18 22:43:56.811	2026-06-18 22:13:56.812	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
f7865a01-4cd3-45a9-90f2-eb4cd4362e15	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgyMzUwOSwiZXhwIjoxNzgxOTA5OTA5fQ.rx8-W4qbIt-s-vtMJ5tYiIxvTt5OrNvVHusKBKdkH50	2026-06-18 23:28:29.203	2026-06-18 22:58:29.205	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
1659e600-91d5-4237-948e-2f42ef9818fe	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgyNDA0OCwiZXhwIjoxNzgxOTEwNDQ4fQ.nmTLvwjvzJH2VwSglSNjS0vXtieVDl_lD-vev0ELI6k	2026-06-18 23:37:28.112	2026-06-18 23:07:28.113	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
332ed5d8-96ea-4f15-8610-473256aadeb7	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTgzNDU2NSwiZXhwIjoxNzgxOTIwOTY1fQ.nUssQsTI39twLe2PKsciactlFXKFmOOXw16GfvKSJjE	2026-06-19 02:32:45.874	2026-06-19 02:02:45.875	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
4f2d7274-b37f-4dc9-979f-5e8b25c7ea4a	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTg3OTcwNSwiZXhwIjoxNzgxOTY2MTA1fQ.Fh1Yz7gFonM2yieuI_84e65_xOpjn6pf-zsg19FAcAE	2026-06-19 15:05:05.965	2026-06-19 14:35:05.966	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
0fb8fbe6-613f-4e4c-9293-d71681b06357	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTg4NTI2NCwiZXhwIjoxNzgxOTcxNjY0fQ.dX-JllEghGEWQBGhvjXvb4jAyN8E7cIuxtR2RKLx65M	2026-06-19 16:37:44.866	2026-06-19 16:07:44.867	node
bf1eb4f9-6375-4aab-8e13-d07ee85cfb90	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTkwNDA3OCwiZXhwIjoxNzgxOTkwNDc4fQ.TvFsK5DYDcT9OaUV9fgzPCR3VKaoMGNd-ceQaXdED6A	2026-06-19 21:51:18.719	2026-06-19 21:21:18.721	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
e0658f05-dd73-4414-98d5-e1819c3f8370	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTkyOTg0NywiZXhwIjoxNzgyMDE2MjQ3fQ.txDOBXyE0x3aVmpaUA_cVGjTH0vJg8NtuyM3HNkIHxA	2026-06-20 05:00:47.915	2026-06-20 04:30:47.916	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
844d8c4c-d035-4f28-a6c8-9a62a28723f7	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTk5OTg2NCwiZXhwIjoxNzgyMDg2MjY0fQ.zs-KYvNGvO4OTrxmOQi5zdS9Mr7Mu2TIHBOK1Jfs5dE	2026-06-21 00:27:44.806	2026-06-20 23:57:44.807	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
82fb085a-fa20-48d2-b5ea-948c31010e64	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjAwMDIxOCwiZXhwIjoxNzgyMDg2NjE4fQ.4xSPYTAqIp814Qhz9LYTMCABQZWb-Cf2edG71I5UEGI	2026-06-21 00:33:38.707	2026-06-21 00:03:38.708	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
0bf6a931-cb0d-4d14-a469-82cf4af98cdc	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjAwMTUxOSwiZXhwIjoxNzgyMDg3OTE5fQ.1Gj9_sVRAetyssauMLT-itanOTp3qt6k8eLK9YIth1g	2026-06-21 00:55:19.393	2026-06-21 00:25:19.394	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
6e689b43-2c0b-4350-9024-b677b6654352	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjAwNjkyMywiZXhwIjoxNzgyMDkzMzIzfQ.K31e8wvQe2f2N8Ln67oMZ0m4f9ZOurZLsvcSDlBgfAk	2026-06-21 02:25:23.833	2026-06-21 01:55:23.835	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
3420d411-cdde-48eb-9ffb-ecd9ac534068	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjAwODcyNywiZXhwIjoxNzgyMDk1MTI3fQ.jU8Usk2OzanRlULolQkx_kBAVb7-06P-2yeIDI_giUc	2026-06-21 02:55:27.826	2026-06-21 02:25:27.827	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
e927cda9-1bbb-4d64-91ed-47462d8b0dee	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjAxNTE5NiwiZXhwIjoxNzgyMTAxNTk2fQ.-cvUnPFsXtd6E8MqcrHv6_FbRQeg6L90Zf5TKzDLKzA	2026-06-21 04:43:16.554	2026-06-21 04:13:16.555	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
009c094e-29ee-4f74-ab9b-324edd33f3e8	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjE0NjQ5NCwiZXhwIjoxNzgyMjMyODk0fQ.4vsHLiiJXOEgYi37b7uiemz_T4hsZcaphT00BvDUEnQ	2026-06-22 17:11:34.395	2026-06-22 16:41:34.396	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
8acf2212-fcf3-4364-9ad5-651eafcbacec	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjE0NjY1NywiZXhwIjoxNzgyMjMzMDU3fQ.LB5dzHIucDK9IuMgt4r7mwdyHfC7oh09kGAPxLDON3k	2026-06-22 17:14:17.093	2026-06-22 16:44:17.177	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
560c6c46-b705-4359-8faa-17b7571faa71	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjE1MjE3NywiZXhwIjoxNzgyMjM4NTc3fQ.ahBbCaBb1vdXQspKRndnEx77rlqeAqVXQ8XZaPQmnrk	2026-06-22 18:46:17.038	2026-06-22 18:16:17.039	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
7fe9d2bb-e459-4a42-9218-f4690f1a2573	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjE1NTczMCwiZXhwIjoxNzgyMjQyMTMwfQ.KLqDddCYgcp1qWBeDBdWYE4jAOxmAy6G0H-9n71nBTk	2026-06-22 19:45:30.455	2026-06-22 19:15:30.458	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
14742111-2b38-4621-9936-0d39e9f0fd81	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjE1Nzk0MSwiZXhwIjoxNzgyMjQ0MzQxfQ.LclAXLhZhHiCbTKHpaXTBNwgDNDO_ToJTZwRiFYCZls	2026-06-22 20:22:21.383	2026-06-22 19:52:21.385	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
b9e60819-4a8e-4833-9700-a9f14e185603	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjE4NDQ5NCwiZXhwIjoxNzgyMjcwODk0fQ.Zu12wt1epqF0M_oqQTJUVBgVywBmGWvxumSrjE5UmMs	2026-06-23 03:44:54.4	2026-06-23 03:14:54.401	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
50e11a76-2d01-4c90-8877-4b51896ccc6b	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjIyMzYxOCwiZXhwIjoxNzgyMzEwMDE4fQ.0MMaAHijyNuy_0lHpeypAe2NuQCnC0CnzsnNnKGdAJY	2026-06-23 14:36:58.763	2026-06-23 14:06:58.773	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
e1c36f1b-5433-40c3-8836-4f488d7c0c78	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjI0MDk1MSwiZXhwIjoxNzgyMzI3MzUxfQ.w767LV2MRYX-1jrvxc0LGY4UnD-6xWsGi9PqfkNWK-U	2026-06-23 19:25:51.265	2026-06-23 18:55:51.267	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
eb5126d4-be8c-47a8-a01a-f974bc2ebd80	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjI0NzAzMywiZXhwIjoxNzgyMzMzNDMzfQ.b2hSjhRc2hd1Mc95jj6a81nIjy9dn-o_GKxGBRzW3B4	2026-06-23 21:07:13.265	2026-06-23 20:37:13.269	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
778aea45-419b-44d4-be3b-343a41f78716	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjI0ODQzMiwiZXhwIjoxNzgyMzM0ODMyfQ.y28cS0BDPQPjJUNjUBSNEtpUZFtsdNTGzRsaTJpxbwQ	2026-06-23 21:30:32.618	2026-06-23 21:00:32.619	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
a69f7497-f108-40ac-8cee-1f39277e3614	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjI1MDUzMiwiZXhwIjoxNzgyMzM2OTMyfQ.ciyhdPyb1Gqosx1xn3U_3Y5JJYmDpV0KjgyStJxL5v0	2026-06-23 22:05:32.215	2026-06-23 21:35:32.216	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
a403c2aa-9173-4ba9-8826-abda6401ed90	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjI1NjE1MSwiZXhwIjoxNzgyMzQyNTUxfQ.c3pRJBjfb-0fkmGH4jfaJxT6nsRb0N_4XK36vS2k4qY	2026-06-23 23:39:11.48	2026-06-23 23:09:11.481	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
d60e9f5b-079f-4eb2-ab31-6641fd7c298f	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjI1NjQ5MiwiZXhwIjoxNzgyMzQyODkyfQ.FYTNqPumbYeHAa041KItyVehfCaiBXEuKvmAjPjeSSk	2026-06-23 23:44:52.129	2026-06-23 23:14:52.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
1b88dce2-4264-4236-91ff-80bdd63bb470	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjI3OTU2NCwiZXhwIjoxNzgyMzY1OTY0fQ.HAw1t6i29kqFbOq3IBn04d3smJQd9giTvJlo6piLwtk	2026-06-24 06:09:24.564	2026-06-24 05:39:24.565	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
b9b27803-52c1-405a-a864-37df20c8a877	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjM0MzY0OCwiZXhwIjoxNzgyNDMwMDQ4fQ.O5jgnBgNo1tiEBrIjyrIvl30KIs17ZMs4w40Ep57UbU	2026-06-24 23:57:28.225	2026-06-24 23:27:28.226	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
4939506a-c47d-48c4-a3d0-b533c25b3ddb	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQwODIwOCwiZXhwIjoxNzgyNDk0NjA4fQ.YkuBmN-fSrj6pmy5m7yiCBd3kiYqkB81CG4DladPDc8	2026-06-25 17:53:28.797	2026-06-25 17:23:28.798	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
8a8c66d9-11d5-41de-a6db-dfa9463a594d	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQwOTY5OSwiZXhwIjoxNzgyNDk2MDk5fQ.hMVRZFrLbjrogp1wORLNU_mIkeOgPZImXl9Xa2yxzkw	2026-06-25 18:18:19.533	2026-06-25 17:48:19.538	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
6d38770d-5ded-4ea3-ae21-c2f64fa3904e	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQxMjc1MiwiZXhwIjoxNzgyNDk5MTUyfQ.b-5kQSW2aAq8TNRNWL5Vx2Gobzq3DORexvWxxsWBt0M	2026-06-25 19:09:12.341	2026-06-25 18:39:12.342	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
8d6e3696-f6b4-4950-be16-014dcef2b5a6	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQxNjU2NiwiZXhwIjoxNzgyNTAyOTY2fQ.b1fazH7R033rt-oEvqkRQZ9lqtSoZfjHE35IDvb6r_4	2026-06-25 20:12:46.422	2026-06-25 19:42:46.509	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
286f90fb-d314-4253-9d22-ef3d8c140766	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQ5NTI4OSwiZXhwIjoxNzgyNTgxNjg5fQ.tQ2oEwzgfvLOgxk3QhqwPdtJXObhqC01BiGhMdEW1CU	2026-06-26 18:04:49.837	2026-06-26 17:34:49.838	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
b488b989-cacd-4102-9d9e-ffad13d2e94d	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQ5NTI5NywiZXhwIjoxNzgyNTgxNjk3fQ.yFQwKL9UQHapnE30HxOiwGM-sRG47Hn0RfdUPSQOOHA	2026-06-26 18:04:57.941	2026-06-26 17:34:57.942	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
fe610e85-7518-49d2-8964-7baac5a9fb6b	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQ5NTMwMiwiZXhwIjoxNzgyNTgxNzAyfQ.AFWQZKO894CxSjTs7XEdXnXtNhwcEKwiH85U6VsD9yw	2026-06-26 18:05:02.532	2026-06-26 17:35:02.533	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
bd5239f9-7772-4952-b167-4761e465ee4b	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjQ5OTQ5OCwiZXhwIjoxNzgyNTg1ODk4fQ.riGgkYNiL6sBp1t5qlf9nWwnCzO9MGUzkbBcV4D8Djo	2026-06-26 19:14:58.862	2026-06-26 18:44:58.895	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
c51fcbdb-7cf2-4ab1-8ef5-2826b7996894	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjUwMTUzMywiZXhwIjoxNzgyNTg3OTMzfQ.S5F8mIwijJWAY4FhnGuoZsQM6lyr1a-hjMNZPj--3j8	2026-06-26 19:48:53.602	2026-06-26 19:18:53.606	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
c3ea67cd-d9f8-4179-b3a2-3ea5645b05f0	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjUxMzQzOCwiZXhwIjoxNzgyNTk5ODM4fQ.tBZkQVXwkrTvNbTtoBx01_F81yPuMNfyf0tDjET3gCQ	2026-06-26 23:07:18.969	2026-06-26 22:37:18.97	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
bdc1cdc3-06e7-4541-95f0-af9324180c7b	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjU3NDg2MSwiZXhwIjoxNzgyNjYxMjYxfQ.P0XMbCXu0Ljyp-RNh6OeR814Rx6qMUoowfAAoXihKro	2026-06-27 16:11:01.878	2026-06-27 15:41:01.88	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
5a870389-c418-424e-989f-1e85b8abcaa9	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjU3NTAwNCwiZXhwIjoxNzgyNjYxNDA0fQ.cMU0welwLbedSpIO4yZeJK_xm8Bq9WfEX-JkkxPn3Oo	2026-06-27 16:13:24.733	2026-06-27 15:43:24.734	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
94d40ab8-dad3-431a-a64b-88d63750ae54	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjU3NTA1OSwiZXhwIjoxNzgyNjYxNDU5fQ.BWNsrGA3_BH8MdqmDg5G1LE49gNcTC580M_e0KZw4Hg	2026-06-27 16:14:19.618	2026-06-27 15:44:19.62	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
2a83905c-2695-4661-a1f3-40143c5aaf97	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjU3NTI2MSwiZXhwIjoxNzgyNjYxNjYxfQ.W5Y1AsxT_Ii8EVmWLi8m78XI0AErMXamwJ5e5ZDa3j4	2026-06-27 16:17:41.909	2026-06-27 15:47:41.911	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
b3a977f0-d8c3-4396-8d45-4177fbd83ae3	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjU5NTczOSwiZXhwIjoxNzgyNjgyMTM5fQ.rpN92TV0vWBTWy_r9qno1GbfRIMIhHmwceefzIIzJfA	2026-06-27 21:58:59.092	2026-06-27 21:28:59.095	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
a304c7e5-1c0a-43fc-8c12-c1e76ca478c7	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjU5NjM0NywiZXhwIjoxNzgyNjgyNzQ3fQ.qFNCzknQZ1bRG853nc5MyDXMetjbzn1S8aw93DvCttQ	2026-06-27 22:09:07.213	2026-06-27 21:39:07.215	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
7f78f442-a82e-4438-937f-65107cce1523	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjY2NTMwMiwiZXhwIjoxNzgyNzUxNzAyfQ.okPHYDn_Ld8IlLEoXBvPl80BUqRf4mYAD0vU9GRbieM	2026-06-28 17:18:22.487	2026-06-28 16:48:22.49	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
799fc5f6-d02b-4c24-934e-fceeef7833fa	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjc3MDM4MSwiZXhwIjoxNzgyODU2NzgxfQ.1-2A_vuwv1gz30ctMdv3KjYZ51BbpzwtWZCabgCW6v4	2026-06-29 22:29:41.908	2026-06-29 21:59:41.909	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
d4925a37-8ff5-48f7-9d0a-4031e949e310	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjc4NTI2MSwiZXhwIjoxNzgyODcxNjYxfQ.GynH8-A2fRHSmyHMvYn24jsbZmFrZFaSUR2Unowavhs	2026-06-30 02:37:41.635	2026-06-30 02:07:41.636	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
f7f76829-5409-4d87-a9b8-9a60fcd9e704	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjgzODU0NiwiZXhwIjoxNzgyOTI0OTQ2fQ.NlGUglmRk7COWKM7zLwFf5_AiWlM0zYjRl0g3C4olb4	2026-06-30 17:25:46.712	2026-06-30 16:55:46.713	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
a64326aa-da4f-48ca-8ae4-514c54e6ab93	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg0MjQzMiwiZXhwIjoxNzgyOTI4ODMyfQ.5HD6LDT6kWknMPabGnf13SkYiTgpn7xOgYHQCShfs2s	2026-06-30 18:30:32.284	2026-06-30 18:00:32.285	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
900890c7-0dc1-42be-a349-604e495ef177	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg0MjUwMSwiZXhwIjoxNzgyOTI4OTAxfQ.XGa9TCp2RvYhFUl1yjzjNv3Pf3A27q_pdHymLTB4qh0	2026-06-30 18:31:41.59	2026-06-30 18:01:41.592	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
1e1cc06f-f7c6-4bee-9df7-d00e6eb92dc5	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg0OTQ5OSwiZXhwIjoxNzgyOTM1ODk5fQ.umte38Dzy5elDdBy2eVus-rX8FXvEYh43lPF_hWINNg	2026-06-30 20:28:19.286	2026-06-30 19:58:19.292	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
27534342-8dea-41fa-80b0-56747ceb87af	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg1OTQ3NywiZXhwIjoxNzgyOTQ1ODc3fQ.teYx9W4UlLbwvrtxEhiaFFYmrJKWqBzxoRsZY7ajJxw	2026-06-30 23:14:37.059	2026-06-30 22:44:37.06	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
b8d9db2d-8503-45de-8ad2-4d89eda5d059	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg3OTAyNSwiZXhwIjoxNzgyOTY1NDI1fQ.nsJAg05gvzBILftoPern1fBE97aHNrdqH2X5FfXzgGE	2026-07-01 04:40:25.693	2026-07-01 04:10:25.694	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
6bd6744c-14e8-497a-97a0-a88c73c8f67f	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjg4MTEzMSwiZXhwIjoxNzgyOTY3NTMxfQ.XlkBdtTvLX2wAn46cqQi3lbY-InaF6fxLRN6SHYJrh4	2026-07-01 05:15:31.381	2026-07-01 04:45:31.387	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
4cd3b3dc-c4cd-4835-910e-bebcbe5cf6aa	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjkyNTg1MSwiZXhwIjoxNzgzMDEyMjUxfQ.KCBJaqWC11LFktkBD-WAAU0SQNpcfVwf4N0jh7mc84s	2026-07-01 17:40:51.5	2026-07-01 17:10:51.501	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
28519df0-5b09-4827-9310-292f57f0a8b0	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjkyNjEyNiwiZXhwIjoxNzgzMDEyNTI2fQ.jkpGid2kuq7ntFCQ5a23Y7rgHE8sxcEkxVufEDeLfE0	2026-07-01 17:45:26.001	2026-07-01 17:15:26.002	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
4ac92285-2054-4127-9531-9308dc938c0b	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjkyNjkzNiwiZXhwIjoxNzgzMDEzMzM2fQ.snawnOoNFiru9LaA9P4BGcD-mp249o2CIKIHnyojtRM	2026-07-01 17:58:56.437	2026-07-01 17:28:56.443	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
6047fd9c-7a52-4670-a921-c444c0b38196	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzAwMzAwNywiZXhwIjoxNzgzMDg5NDA3fQ.tsYNDJDhzGQej0lZvCFuuRNokOo_nMWjFED1O0Our1U	2026-07-02 15:06:47.711	2026-07-02 14:36:47.712	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
58923f56-0649-407a-a894-d34c2cf48783	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzAwMzQxOCwiZXhwIjoxNzgzMDg5ODE4fQ.qmncOcH96BAasXfgUyJi5yGsZFRCjXBt77CpwESLzGo	2026-07-02 15:13:38.207	2026-07-02 14:43:38.208	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
f1c5d996-ecf9-46bb-9d55-6b57e9aabfad	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzAyMzI2OCwiZXhwIjoxNzgzMTA5NjY4fQ.z6lL2rApjxii4hZ6NwYuCPRYd1n11kkWNrfR_ygxDmQ	2026-07-02 20:44:28.438	2026-07-02 20:14:28.472	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
94302b81-3063-4fec-a6b6-41dc4ab4dd94	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzAyNjUzNCwiZXhwIjoxNzgzMTEyOTM0fQ.SMgoNXemoLSiHxQU31NGv44S5lrFkFkdtlj0Uti1yn4	2026-07-02 21:38:54.164	2026-07-02 21:08:54.165	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
2dc2e13b-3b4f-47c2-be78-9ea496b9adaa	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzA0MTM3MSwiZXhwIjoxNzgzMTI3NzcxfQ.-fKMcNde38-g0AvIut3V2GDjD2OMdAzxDSt-r9ZqqSQ	2026-07-03 01:46:11.449	2026-07-03 01:16:11.45	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
c07620bb-db18-4e82-9bb3-ba03989dc4b0	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzA5ODA3NywiZXhwIjoxNzgzMTg0NDc3fQ.Z2bCW_SfBjSy_bv9a230RSf_wUfuMQYCYytKoV710sw	2026-07-03 17:31:17.561	2026-07-03 17:01:17.562	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
a0beea25-06ba-4a95-9fbd-e1098eec13c3	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzA5ODE4NiwiZXhwIjoxNzgzMTg0NTg2fQ.a4rIgA4Xv5wb1-JCuN1Dcbfc0Qyj1A8VsjxwfDOz0Uw	2026-07-03 17:33:06.154	2026-07-03 17:03:06.155	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
02e05748-245f-49c7-8f10-9cfae369a610	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzA5ODE4NywiZXhwIjoxNzgzMTg0NTg3fQ.zwwPJ2TeXB8u7S6Et7itYDuTAaRSLyg6RNWR_3ejpmI	2026-07-03 17:33:07.246	2026-07-03 17:03:07.247	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
d571dc4c-e218-4144-a01d-9f3622f26e0e	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzA5OTg0OCwiZXhwIjoxNzgzMTg2MjQ4fQ.lmUaf9gWD8Ly5-p8bMJFhOOzfvuM7VvZIFo5SFyPopc	2026-07-03 18:00:48.759	2026-07-03 17:30:48.767	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2c089567-9354-4bc7-9a77-1a5c85097990	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzEwMDMxOCwiZXhwIjoxNzgzMTg2NzE4fQ.jY-JUS-42SDaFx79H0G3phbe5Upm55iSwVuNMflRjB4	2026-07-03 18:08:38.814	2026-07-03 17:38:38.815	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
c491a074-ca84-4ecb-b974-d332439bb5b0	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzEwMDU2MCwiZXhwIjoxNzgzMTg2OTYwfQ.BL_f6iPNonx5Bk_bqSFAatdJFwFYjd8oj0lUXmirlsU	2026-07-03 18:12:40.514	2026-07-03 17:42:40.514	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
7951306c-3c06-4c7e-9357-4b9ee1e33413	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzEwMjkyNywiZXhwIjoxNzgzMTg5MzI3fQ.i2RxLEHqu0JN0zOBJxf7Sb_xiHRvO3a3DOhOkeXF5VU	2026-07-03 18:52:07.886	2026-07-03 18:22:07.887	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
9cc71443-c75c-41da-9b3e-2e631395e32e	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODMxMDQ3NzUsImV4cCI6MTc4MzE5MTE3NX0.3f5DbhZqTUOmUsofXOGLWarPVC_dtEradaUkr1ukyTY	2026-07-03 19:22:55.995	2026-07-03 18:52:55.997	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
088cc15b-a61f-4691-b073-14fcbd2ae893	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzExMTc0MiwiZXhwIjoxNzgzMTk4MTQyfQ.5lgCUkQAsC8yKUF8m5k5E8mXrJJbxsXsdMJ17d9E720	2026-07-03 21:19:02.563	2026-07-03 20:49:02.564	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
0e341c28-9ffc-4ffc-86d9-4449c8bd6137	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzExNjA2MiwiZXhwIjoxNzgzMjAyNDYyfQ.yra_HwzOSMf5IvZz2jnFPgNuEX5OTsp1nDbQc4ZKi7c	2026-07-03 22:31:02.119	2026-07-03 22:01:02.12	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
030a500e-1e74-420b-b555-066dd7f85398	8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODMxMTcwNzAsImV4cCI6MTc4MzIwMzQ3MH0.GSI5BHsmhqS1nq1cPPtK2Qgyt4QmME4Z97MeKLYBIu0	2026-07-03 22:47:50.128	2026-07-03 22:17:50.129	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
2a73272e-c4b6-4637-9056-99063fb39e82	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODMxMTc3NDAsImV4cCI6MTc4MzIwNDE0MH0.f2WqzSuXvOiq9MNXan4Fui7z4Pb_1WasMUt4aFV1iFc	2026-07-03 22:59:00.123	2026-07-03 22:29:00.124	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
d57a288b-fedf-437f-ad16-3064934214cd	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzExODAzNywiZXhwIjoxNzgzMjA0NDM3fQ.VxOCZRdg5gcb5VF4VvqzPK3tnHUEW4PAb7JXh6nWu8Q	2026-07-03 23:03:57.097	2026-07-03 22:33:57.098	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
ead0c297-42c2-43a8-9a8e-b337a0242bf0	8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODMxMTgxMjcsImV4cCI6MTc4MzIwNDUyN30.KWI459KhjWeKdYiYKT5ZnoAc_yqlMR3-aFZ2XPQ1dqg	2026-07-03 23:05:27.378	2026-07-03 22:35:27.38	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
b61714df-a77b-422d-9516-273c0c196044	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzE0MTMxNywiZXhwIjoxNzgzMjI3NzE3fQ.IvcV7kC5l6GQfBWMWhGtryeX8GyKB5ILqrNM4hc0GLc	2026-07-04 05:31:57.977	2026-07-04 05:01:57.978	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36
a7a063ae-8172-4e7f-9590-cf65088c5904	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzE5MzkxNCwiZXhwIjoxNzgzMjgwMzE0fQ.TnphI-jqSnF1G2W7dqUk7zQgy55qiWDyCWbd_oat79k	2026-07-04 20:08:34.197	2026-07-04 19:38:34.198	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
208603f3-aab3-4333-8347-91e3b554970e	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzIzMDQ3MCwiZXhwIjoxNzgzMzE2ODcwfQ.3MpD-739jdc5id8cxoOkFnrrdJ--quhrWPXxpbeh0Vo	2026-07-05 06:17:50.935	2026-07-05 05:47:50.936	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
a3f88dc3-beb6-4d24-8f84-41ff7c26fe17	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzM0ODc4NywiZXhwIjoxNzgzNDM1MTg3fQ.YzNCGAoqbYf_93LB5GUnLJI205cjPQTsbAMYwsgTGts	2026-07-06 15:09:47.469	2026-07-06 14:39:47.471	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
ff86ac27-125c-4c1b-9385-b3a3dd7ce645	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzM3NTk0OCwiZXhwIjoxNzgzNDYyMzQ4fQ.yF9DGnHI5qTYfMyRoNBGRYhvvwTXK9EE1pDquwP0g9o	2026-07-06 22:42:28.532	2026-07-06 22:12:28.533	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
473e0193-579e-4c73-9bbe-99ed6f0091f6	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzM3NjU4MCwiZXhwIjoxNzgzNDYyOTgwfQ.1RDdndCr_ZC55VyH1nybauXjqrgk678rRfqgidCdqVQ	2026-07-06 22:53:00.126	2026-07-06 22:23:00.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
56b9b1a7-87c6-48f1-8740-85c40ea52dff	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzQ1NDc5MCwiZXhwIjoxNzgzNTQxMTkwfQ.1Xk4FkFduhM3Sj8WUuH0rcX6yJpbixavE9VDz6VNgJw	2026-07-07 20:36:30.012	2026-07-07 20:06:30.014	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
2ddbbb2e-91aa-4313-bdad-a804b3c05aab	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzUzMTExNywiZXhwIjoxNzgzNjE3NTE3fQ.aphGTP_njF_CxfOD3rtrx8nJd7l8QKupo4re59PsUFA	2026-07-08 17:48:37.001	2026-07-08 17:18:37.003	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
1a697a2e-f6a5-4621-8968-9b609115aa02	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzU0NjM0MSwiZXhwIjoxNzgzNjMyNzQxfQ.IOYMQKbQhX2LfAqzLd_LrZSB-reWz38Po3NgzYJdUbw	2026-07-08 22:02:21.714	2026-07-08 21:32:21.715	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
1167c09d-b5a2-4edb-8a5e-1b938c3c0e47	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzYzMTg5NiwiZXhwIjoxNzgzNzE4Mjk2fQ.8pU8xo08VDJ0hB_CSAn0RLakv6-0RAyoL_j2r8JVE74	2026-07-09 21:48:16.835	2026-07-09 21:18:16.838	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
fa98a126-c32f-432b-9bae-016b45c9b5a1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzYzMzU4NiwiZXhwIjoxNzgzNzE5OTg2fQ.mkc-QgK03k_I9pnUGMyzWbjHSre7Qk-vqcwC3W9jiYE	2026-07-09 22:16:26.338	2026-07-09 21:46:26.345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
20f10995-69b2-47ee-b626-fa46a5ef4ac9	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzYzMzczMCwiZXhwIjoxNzgzNzIwMTMwfQ.GlU6siHfDhNqgOj8GOHhCRBVo1sMwDOks53ckT8R9F0	2026-07-09 22:18:50.435	2026-07-09 21:48:50.436	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
b4bdf1fd-1aac-447f-b980-9514b0ea2701	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzY1MjgxMywiZXhwIjoxNzgzNzM5MjEzfQ.-UzLX0q85d-Lii-vA7pR_ttltp_t3pmYPC3l4EALVmg	2026-07-10 03:36:53.652	2026-07-10 03:06:53.665	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
3fd291c5-e576-4d83-ba5d-5166a88f2baf	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzY1NTk4OSwiZXhwIjoxNzgzNzQyMzg5fQ.PI4r7p-prjh5vj9kvbxmOw7zVLJWygDWlg0hd0_hGqY	2026-07-10 04:29:49.632	2026-07-10 03:59:49.633	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
357f4d71-5f5a-4c33-97a5-917b677ed46a	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzY1NjkwNiwiZXhwIjoxNzgzNzQzMzA2fQ.3JtDfafJTOxHkfKQjyHDTsMB56G6hRFyZMt_bBKzMN4	2026-07-10 04:45:06.219	2026-07-10 04:15:06.22	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
703db2d5-1daa-4f39-9494-4aebcf42b978	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzgwNjY5MCwiZXhwIjoxNzgzODkzMDkwfQ.SyzsOQJWnMU7KyXLMNlJYglA21_-GPuqvXq01KacVX8	2026-07-11 22:21:30.086	2026-07-11 21:51:30.087	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
0aa44667-f903-4d3e-abb4-0641670911bf	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mzg5ODQwNiwiZXhwIjoxNzgzOTg0ODA2fQ.ueJxzfyBUVVF-8BjNtiphK3pfe21srWsRVloRYHm2Bo	2026-07-12 23:50:06.417	2026-07-12 23:20:06.419	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
a3fe4415-79d6-4b3e-a433-e4d72cc0c949	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDAzNzE0OSwiZXhwIjoxNzg0MTIzNTQ5fQ.cEpnv36ColPAglKUgKbwNfwTUgkXpVpa2oB2eMxB1Js	2026-07-14 14:22:29.144	2026-07-14 13:52:29.145	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
db42c97c-c2fa-459e-9f83-eef694fe2acd	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDA0NjY5OSwiZXhwIjoxNzg0MTMzMDk5fQ.7FUD1DhFiypxh6axh1SERBokSZprMjj38j_5_Ti6VPQ	2026-07-14 17:01:39.021	2026-07-14 16:31:39.022	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
a40b8f78-f668-4960-8b91-6964d7a3ccb1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDA1MzA0NiwiZXhwIjoxNzg0MTM5NDQ2fQ.hzlL46VJylgTgYIrIvOOiHacYj1Wki9jYBeDgWuBhLg	2026-07-14 18:47:26.093	2026-07-14 18:17:26.094	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
987fffe3-401a-444e-bdb8-71a2abe0c330	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDE0MzQxOCwiZXhwIjoxNzg0MjI5ODE4fQ.V65CH07qUI5KMtQGSRLpGR1hK2LXLq4-DUrEXe4bJLE	2026-07-15 19:53:38.306	2026-07-15 19:23:38.307	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36
51f86417-cc36-4482-85df-bb5e8faa2b82	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDE0OTU1MiwiZXhwIjoxNzg0MjM1OTUyfQ.emdwxKGOqYZMDxFpo9RyNlaUH5s_t6JIZrZlVIy9Z9o	2026-07-15 21:35:52.157	2026-07-15 21:05:52.158	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
7dd3c4a1-7f41-4010-ae46-a60b38660cab	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDE1MTM0MCwiZXhwIjoxNzg0MjM3NzQwfQ.KDrreVu3UhRbjRX9YSwdR389-Hgd0VhvIKKfje9qqvQ	2026-07-15 22:05:40.752	2026-07-15 21:35:40.763	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
f8c6e4c2-3dab-4cff-b931-da8d0d0359e5	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDE2NDQ4MSwiZXhwIjoxNzg0MjUwODgxfQ.6e7XJO6W5fX5xgNy1l5VTUh3cQLwf2BSpfiVxYMLllM	2026-07-16 01:44:41.618	2026-07-16 01:14:41.619	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36
c2bef213-fc85-4a8e-bbd2-9684ecf640f8	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODQyMjA1OTksImV4cCI6MTc4NDMwNjk5OX0.x5tMN-vw_emdCBH-Ky5xvg2NkqT26QqC3UKyy3zQRAc	2026-07-16 17:19:59.445	2026-07-16 16:49:59.446	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
b1d77646-ed50-46c0-b918-c0062f48bd5e	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDIzMDMxOCwiZXhwIjoxNzg0MzE2NzE4fQ.h94frPMqwuNQ5giPLNDDgeHuLA1Sikb1V-_rQwirn5Q	2026-07-16 20:01:58.003	2026-07-16 19:31:58.004	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
37f1caa8-4e1c-47cb-ab50-9ff6a185f5b3	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDIzMTc3NCwiZXhwIjoxNzg0MzE4MTc0fQ.73sRlYTwsV2rIVEdF60ogRvqlLU44ZZJv09Y38PwAMg	2026-07-16 20:26:14.601	2026-07-16 19:56:14.602	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
e4d70d42-5c1e-4cbd-9bf1-5891b32285f3	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDI1MDkwNywiZXhwIjoxNzg0MzM3MzA3fQ.g0hspbunUhh0cExgscJ4J9JQwqjCQuPKWI0dgIq-cqU	2026-07-17 01:45:07.424	2026-07-17 01:15:07.434	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
3c7bdd68-64b9-4c6b-8897-2fb410e6ae1b	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODQzMDAwNjcsImV4cCI6MTc4NDM4NjQ2N30.VJBv605YWGAYO4ixQt-KawchGRhQGvYVusjnCENE2ac	2026-07-17 15:24:27.814	2026-07-17 14:54:27.815	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
8db84cf4-a32b-41fd-8849-20c39a5c6a38	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDMwMDY3NSwiZXhwIjoxNzg0Mzg3MDc1fQ.QqVfxFITeYM4Pfn3w83zjgT4HQU6AUmi8ukl8vo1Vdw	2026-07-17 15:34:35.508	2026-07-17 15:04:35.509	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
15c0123f-0c98-4f94-85b2-f3a4e4b52cc0	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDMxNTMxMywiZXhwIjoxNzg0NDAxNzEzfQ.YvOP7V838vG7FTJhVy2Wzmpni-ygNkPGzK5_3DoKXkI	2026-07-17 19:38:33.801	2026-07-17 19:08:33.804	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
ac3d5187-c6ef-47ef-bf4c-2e60fd8c7534	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDM0NDkzMCwiZXhwIjoxNzg0NDMxMzMwfQ.i81R8iqdlGQVniDEx7dhXLpdLiMo1ECUc0z-Z063iIo	2026-07-18 03:52:11	2026-07-18 03:22:11.003	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
441881f3-ffc5-49b4-bf9b-002d1a292f55	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDM0ODExMiwiZXhwIjoxNzg0NDM0NTEyfQ.sOsDQfnjiSRdVTomglhqvId1lOxMyzLmxgsBxUqCxhw	2026-07-18 04:45:12.158	2026-07-18 04:15:12.16	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
812fdb14-2bfa-4779-a0f8-1c97ba69b840	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDM4Nzc0MywiZXhwIjoxNzg0NDc0MTQzfQ.HchvpiayWfNFdmTGdFGfAQVhZbKV9cwre8-9_E9onG0	2026-07-18 15:45:43.867	2026-07-18 15:15:43.954	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
720fb772-2029-4895-9949-28b8b250bb0e	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDQwMDEzMiwiZXhwIjoxNzg0NDg2NTMyfQ.mH1WT8l28gVBoRx0vychGd00176ZEHlBee2k_n2R2yo	2026-07-18 19:12:12.294	2026-07-18 18:42:12.295	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2c69b498-8242-4adb-99f7-2bad9968efbb	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDQwNDU0NiwiZXhwIjoxNzg0NDkwOTQ2fQ.RrZoMO6YEbJgrPrw1gDbfNlp1zBFekzkGBgYoC1078w	2026-07-18 20:25:46.833	2026-07-18 19:55:46.834	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36
cfb8fd25-7674-463c-8553-5488c991eb11	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDUxNTQ3MywiZXhwIjoxNzg0NjAxODczfQ.zT2iN_N4GVNtdWRi9AK93wJiSKC_5A28xG40nKTX1LI	2026-07-20 03:14:33.979	2026-07-20 02:44:33.981	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
694349d5-9d44-41b6-a7df-fb8728aded68	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDY1MDg5MywiZXhwIjoxNzg0NzM3MjkzfQ.PonLd-4RGGx6O5EoQFfQDhCc4ofWAN64vMKA4lbG758	2026-07-21 16:51:33.797	2026-07-21 16:21:33.798	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
ba9e6859-a855-4a75-b2da-8fe11832e868	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDY1MDkxNCwiZXhwIjoxNzg0NzM3MzE0fQ.Ifdm3qxvmFAsbwX6mobzJpM4nuTUmJG9wYR3-EP1r2c	2026-07-21 16:51:54.499	2026-07-21 16:21:54.5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
430d90a2-f58e-46d8-a6b1-90fe1a49a2a5	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDczNzk1MiwiZXhwIjoxNzg0ODI0MzUyfQ.CIbixB_gLxDnycfDjgXpvLcByY-iQQwKfrYYYeENakM	2026-07-22 17:02:32.208	2026-07-22 16:32:32.293	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
87d44e0f-3028-4662-b254-5a1dd92b0b76	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDczOTU0NSwiZXhwIjoxNzg0ODI1OTQ1fQ.th4KpMXlOfVGcOwLZDv4qGK5aDyMISSzEZmRBUjZNNc	2026-07-22 17:29:05.634	2026-07-22 16:59:05.635	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36
60d5ccc4-8014-4dff-a00d-3b16c138fd82	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDczOTY1OCwiZXhwIjoxNzg0ODI2MDU4fQ.A8_Qd0g5jJIPYdfOL4fgICBdpyk_baXcZmvlJU1oLvA	2026-07-22 17:30:58.335	2026-07-22 17:00:58.336	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
29d41c71-0e8e-4df5-8997-4bfed58f2db1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDc0MDY5NywiZXhwIjoxNzg0ODI3MDk3fQ.RHy_T2XG9plu09F0fa-gdDLGZWt54omFZ68nMIK_bSY	2026-07-22 17:48:17.661	2026-07-22 17:18:17.669	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
331e0f8c-a378-4891-a0a9-521c25d7d88f	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDc0Mjg0NCwiZXhwIjoxNzg0ODI5MjQ0fQ.6Cdg8o9i0kwPe0_sSzudm4jHGRVHZUK0nbYge0BS1g4	2026-07-22 18:24:04.034	2026-07-22 17:54:04.036	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
1c4d762a-2b79-4f85-a0b9-b4c97449a670	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDc0Mzg0NiwiZXhwIjoxNzg0ODMwMjQ2fQ.yBWpuqfHPaEksr3Pis5CU9B3kZkwTD9VjiMQLkVDjqQ	2026-07-22 18:40:46.664	2026-07-22 18:10:46.67	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
ed329730-438e-4e61-9f2e-e63ec4bb81b0	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDc1MTgxNiwiZXhwIjoxNzg0ODM4MjE2fQ.PY1BRSfO1tTJZp8SDHnYkpTUaFuSt7o1dW_7NrjgcCo	2026-07-22 20:53:36.94	2026-07-22 20:23:36.942	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2b5d8037-e31e-4eb4-982c-22111fc257d3	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDc1NzM5NCwiZXhwIjoxNzg0ODQzNzk0fQ.601aWq0ss4hn4ji-mK6rmAdrgY3snm78Qw3bCj0UTCk	2026-07-22 22:26:34.645	2026-07-22 21:56:34.648	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
7e5c4470-29dd-411a-9439-f689bbefe33e	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDg0MjYwNywiZXhwIjoxNzg0OTI5MDA3fQ.EezvWYKSjmjPjKIoLkvcNMb3HoxHvLHluEtc08-bITs	2026-07-23 22:06:47.647	2026-07-23 21:36:47.733	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
f7891e27-3d03-4be9-bf88-6d63b8e23449	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODQ4NDYwMzcsImV4cCI6MTc4NDkzMjQzN30.9SSdsp6lEgkDRP4eZNcNSyRUndSdVBVjINCFODZjdAA	2026-07-23 23:03:57.441	2026-07-23 22:33:57.442	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
d98fe63d-b1b7-4e33-a70e-0bf570f2a933	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDg0NjU0NiwiZXhwIjoxNzg0OTMyOTQ2fQ.LsqK61FdMCTu3TezFTYEmCNI_xMpE_aTCQPoFamG2iw	2026-07-23 23:12:26.44	2026-07-23 22:42:26.441	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
4a8274b5-3e2b-43e1-bb17-20f19c2fc3f0	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDg1Njc3NiwiZXhwIjoxNzg0OTQzMTc2fQ.k1A13giF0TGxAoUm3dQdNq1myMqCZVz1UPInWkb7iow	2026-07-24 02:02:56.64	2026-07-24 01:32:56.645	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
0e9a7bb8-22b1-4ad0-9e7f-76e508abb1b1	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODQ4NTgxNDYsImV4cCI6MTc4NDk0NDU0Nn0.d4KX2cMOwIwqoyvNfjafG7VXtqjGkYM9-Onek215L2I	2026-07-24 02:25:46.284	2026-07-24 01:55:46.286	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
d8206c47-bdbe-459b-8298-5cd0b31e4dcb	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDg2MDIyMiwiZXhwIjoxNzg0OTQ2NjIyfQ.CaWe5JLcjTgS6h_gfVVm_rQmdaYOX_gKwKP_XexuMqI	2026-07-24 03:00:22.559	2026-07-24 02:30:22.56	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
1d0fd626-d041-41bc-a958-634c1fab5cfa	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODQ4NjA5NDYsImV4cCI6MTc4NDk0NzM0Nn0.jtFeUEULhTKCUu839jj1tcDR7Aqxl8AAGItjzlAPo1g	2026-07-24 03:12:26.79	2026-07-24 02:42:26.793	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
9a7161c4-e1bd-485e-ac37-7cdd98862784	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODQ4NjE3OTQsImV4cCI6MTc4NDk0ODE5NH0.Fc6jOOUl35e-gEhY_de3RNjyyREise_aSSX3NbXq7Bc	2026-07-24 03:26:34.602	2026-07-24 02:56:34.606	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
02a9e5cc-6783-4cfa-97f9-b289e34ccfd8	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NDkzNDA2MywiZXhwIjoxNzg1MDIwNDYzfQ.C_Zk137BcxRaoFEZ9IDmnsFjld5E4hkpq3U1Ihyb2V0	2026-07-24 23:31:03.68	2026-07-24 23:01:03.681	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
5104e9e8-31eb-418f-8955-e85e3ef941f2	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTAwMDYxMywiZXhwIjoxNzg1MDg3MDEzfQ.46vxcIRuUYkaRSeORLNipDW6pcDXGcU0C1WhiQlNBn8	2026-07-25 18:00:13.233	2026-07-25 17:30:13.234	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
a101ba7b-e5c3-4397-b696-525f9ab637c8	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTEyMzI5OCwiZXhwIjoxNzg1MjA5Njk4fQ.uL_vbekzmUYZArYC8my7LF9kPUdV5WDKmyu0pEqRxgo	2026-07-27 04:04:58.01	2026-07-27 03:34:58.011	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
4fa04b26-2f85-4e22-867c-6cf26c1c0596	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTE3NzE5NCwiZXhwIjoxNzg1MjYzNTk0fQ.j6iGRawe6W-yv-nvZK_psF-rNTm1qxGxEVSbxrAD6vE	2026-07-27 19:03:14.569	2026-07-27 18:33:14.571	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36
0d65a4e0-aada-4a0d-819e-5fd734a137c4	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTE5MzgxMiwiZXhwIjoxNzg1MjgwMjEyfQ.wo-97LlsS7ftR_hZOrJlIM8YzcXCMFYhV_Km3FNYcFw	2026-07-27 23:40:12.902	2026-07-27 23:10:12.938	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
fb7e1363-01eb-409a-ad8f-7154ac565c7e	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTE5NDEyMywiZXhwIjoxNzg1MjgwNTIzfQ.Eewpi6llsyNdtuDqKTdSMpjclPb9tSJls2SuXECMDYA	2026-07-27 23:45:23.977	2026-07-27 23:15:23.983	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
9e19de7a-64ff-4451-96f8-b10a4c995aad	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTE5NTcwNywiZXhwIjoxNzg1MjgyMTA3fQ.d6Wck8wHhykk-jfRyjV7aV2KYulYSYACJ4oa5i3LveI	2026-07-28 00:11:47.859	2026-07-27 23:41:47.861	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2fff678b-cfaf-49bc-bbc8-711a6b83ca39	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTI0NDMxOCwiZXhwIjoxNzg1MzMwNzE4fQ.RY5TLmnwjZql3DJM1-7fGA6uzhnzCDxk_xjLz_6CBHQ	2026-07-28 13:41:58.107	2026-07-28 13:11:58.109	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
c19408af-ce56-41ad-a57f-d066f809cad0	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODUyNzQ2MzcsImV4cCI6MTc4NTM2MTAzN30.s7e0QNG_WoYy_QtLyNwea6OuFsJ1z2A3X7ZRI9J9K-o	2026-07-28 22:07:17.698	2026-07-28 21:37:17.699	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
dc1910b3-bea0-421c-866e-5b503322c9c5	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTI5NzE1OCwiZXhwIjoxNzg1MzgzNTU4fQ.r7Drj1BuAOJM07lX6YALpEHkezQzdrNZ6EHWP0aS5p4	2026-07-29 04:22:38.12	2026-07-29 03:52:38.121	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
6986d242-efe2-488a-a330-06a7b4404078	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTM2MDY4OSwiZXhwIjoxNzg1NDQ3MDg5fQ.N_r_nB4sn4XLNyotaMe52h-4YZVoIqKkUh9HZuVGwZk	2026-07-29 22:01:29.336	2026-07-29 21:31:29.337	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
6b2553f0-a272-468f-bb71-ee6015612555	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTM2ODk5NCwiZXhwIjoxNzg1NDU1Mzk0fQ.ErY1QiVsJeNuAPiSN1IdIe6lVf4OvmXcrJ2POC3Z40Q	2026-07-30 00:19:54.12	2026-07-29 23:49:54.121	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36
5dfdb4b2-534a-49c1-87e2-1dacdcebb965	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTM3MDg3MiwiZXhwIjoxNzg1NDU3MjcyfQ.-LbwgTpxwEcPsikSdiTypI5L4I-ySx6OXcGO5_gbKRA	2026-07-30 00:51:12.447	2026-07-30 00:21:12.479	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
19258367-3fbf-4bd0-ba48-a0c22a9991bd	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTM3OTIwNywiZXhwIjoxNzg1NDY1NjA3fQ.TLhoq7IT4QFgPsxUAVKR7Ng7YheU4t-f4zhfMBTpW7U	2026-07-30 03:10:07.026	2026-07-30 02:40:07.027	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0
49e4f5fd-d93c-4b21-98aa-b24ca5093d5f	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTQxMzIzOSwiZXhwIjoxNzg1NDk5NjM5fQ.yeVF5Umnqpgr3IMHBjzTKU-EZyiqNzuLTZxbvD5lSuQ	2026-07-30 12:37:19.434	2026-07-30 12:07:19.435	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0
f64f94f9-20b4-4d68-8db1-0a49e30f90d1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTQxMzI2OSwiZXhwIjoxNzg1NDk5NjY5fQ.LXI-EvJCDxC2RJzLDdCHV8xHe-k87eASR8KauZ9-CyY	2026-07-30 12:37:49.427	2026-07-30 12:07:49.428	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0
e65590bb-2445-47bf-bd6d-459fc0f433fb	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhc2Vzb3IiLCJpYXQiOjE3ODU0Mjc0NzgsImV4cCI6MTc4NTUxMzg3OH0.lb-6XaoPZ-mv1oPXEB9FmO_aZamoMmvr8EgfDiBRLTo	2026-07-30 16:34:38.409	2026-07-30 16:04:38.41	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
1c6c1559-2fbf-4a00-ab59-53af5a6e66e3	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTQ0Nzc1MywiZXhwIjoxNzg1NTM0MTUzfQ.Dv7cVSVGcyL0qoWv70IF8eSHVobmLM1RalRyak56I7M	2026-07-30 22:12:33.65	2026-07-30 21:42:33.651	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
5391ad1c-f97a-4362-9bac-5dd51b0f3959	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTQ1NDc1MywiZXhwIjoxNzg1NTQxMTUzfQ.8nLPa8EeJ45XLe8yPej0Udk0PihVE3LMZZ9CxWFe6Mk	2026-07-31 00:09:13.277	2026-07-30 23:39:13.278	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
14aa1c3d-26d8-42d6-9233-8ce539781f86	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTUxNDI1MCwiZXhwIjoxNzg1NjAwNjUwfQ.bMhP_7mztji7ZUYypINEClckXjOD-M4ks-Nz-1YfzCA	2026-07-31 16:40:50.803	2026-07-31 16:10:50.804	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
315d759c-a33e-4304-bd86-6ae2e09544d6	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTU0Nzg4MiwiZXhwIjoxNzg1NjM0MjgyfQ.cov3y7iaRHcpB65REvjt8pZvMaGDZVf_gfpZ8DRRrwM	2026-08-01 02:01:22.849	2026-08-01 01:31:22.853	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
b094db09-c949-4c2b-b31f-7f61a2b7cec8	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NTU1NTE2OCwiZXhwIjoxNzg1NjQxNTY4fQ.hI3a0Nr41KxvA1osrS72jogfq9op6YldZkm2CmeQHMs	2026-08-01 04:02:48.897	2026-08-01 03:32:48.898	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
\.


--
-- Data for Name: tarjetas_agencia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tarjetas_agencia (id, nombre, metodo_pago_id, ultimos_cuatro, descripcion, status, creado_at) FROM stdin;
2	PRECOMPRAS CLIC AIR	13	5100	PAGOS REALIZADOS CON LAS RECARGAS A VE	active	2026-06-14 04:28:37.166
1	Samtur Bancolombia Negocios	2	9240	Unica y exclusivamente para compras de proveedores	active	2026-06-10 00:15:52.174
\.


--
-- Data for Name: tipos_documento; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipos_documento (id, nombre, abreviatura) FROM stdin;
1	Cédula de Ciudadanía	CC
2	Cédula de Extranjería	CE
3	Pasaporte	Pasaporte
4	NIT	NIT
7	PPT	PPT
9	Registro civil	REG
10	T.I	T.I
\.


--
-- Data for Name: tramos_vuelo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tramos_vuelo (id, prod_tiqueteria_id, aeropuerto_origen_id, aeropuerto_destino_id, salida, llegada, nro_vuelo_tramo, orden, asiento, checkin_status, nro_tiquete, aerolinea_id, plan_equipaje_id) FROM stdin;
6d8c9210-01b8-47e6-ab7d-073c31b38495	de386459-0ad5-4525-b18d-be6c9cfeed5e	72	23	2026-06-19 19:45:00	2026-06-19 20:40:00	8851	1	\N	realizado	\N	\N	\N
74956737-3803-4a91-a073-5499a92c632b	cf2cb956-d807-4972-a8d5-25959b666635	1	20	2026-06-05 10:05:00	2026-06-05 11:20:00	AV4855	2	2D	realizado	1342156938471	\N	\N
11264327-a08a-4c46-aebb-7b83cd378b4d	cf2cb956-d807-4972-a8d5-25959b666635	6	1	2026-06-05 05:25:00	2026-06-05 07:00:00	AV8525	1	8A	realizado	\N	\N	\N
630b14ff-4a4c-405e-abe9-7f1b98bde45d	3fd5a3f2-9480-4160-82b6-ce75539bf9b1	75	23	2026-06-20 12:25:00	2026-06-20 13:40:00	9110	2	\N	realizado	135609960	\N	\N
28efea85-24df-42f1-bb6b-5a9e40e2c84e	3fd5a3f2-9480-4160-82b6-ce75539bf9b1	20	75	2026-06-18 16:15:00	2026-06-18 17:30:00	8941	1	\N	realizado	\N	\N	\N
2dd6b64f-6a7f-4d03-837c-2c0fae02deac	6ae4cae1-d26d-469c-a4d6-88f7854ff90e	23	20	2026-05-19 13:25:00	2026-05-19 14:10:00	8946	1	\N	realizado	\N	\N	\N
530f3889-2193-454f-a0e3-095c7533c1e2	4223ba98-60e8-4f42-afc5-e6222e430f08	22	23	2026-06-20 21:20:00	2026-06-20 22:20:00	VE8989	1	\N	realizado	\N	\N	\N
d9472dbf-62ec-4e9a-a9ce-5fb8e15fde7d	d34a28ff-7b20-4194-a29c-5bb643e78476	20	1	2026-06-01 11:50:00	2026-06-01 13:00:00	AV4854	1	\N	realizado	\N	\N	\N
d6ee82f8-dcf2-4f2e-a694-7c2472360869	d34a28ff-7b20-4194-a29c-5bb643e78476	1	6	2026-06-01 14:10:00	2026-06-01 15:45:00	AV8582	2	\N	realizado	1342156750204	\N	\N
68eb13e2-fc97-4e20-8419-ffdda780de1f	e410f6aa-d981-4823-8cfa-79f54763179d	23	20	2026-06-06 11:35:00	2026-06-06 12:20:00	8944	1	\N	realizado	\N	\N	\N
b661c207-eb5f-41b3-9ef8-131172b37fe7	48093ab9-a3ad-4cd1-8dd9-85d4702287b6	23	20	2026-05-28 16:40:00	2026-05-28 17:25:00	8948	1	\N	realizado	\N	\N	\N
f470dc5d-aa51-4b65-ba80-9993662dbafc	43e5e990-6b89-4983-b839-b2069ad713af	20	23	2026-05-20 12:25:00	2026-05-20 13:08:00	8673	1	\N	realizado	\N	\N	\N
857be6ce-4682-4148-8f75-59353163ab66	c4fff3f5-e53d-442c-a010-930051ad74b1	20	23	2026-05-28 17:40:00	2026-05-28 18:30:00	8949	1	\N	realizado	\N	\N	\N
35bfdc11-b191-49ed-bac3-f50b8768bdf0	81579340-95da-4225-9a1f-80876c7dc532	23	20	2026-06-16 17:30:00	2026-06-16 18:15:00	VE8950	1	\N	realizado	\N	\N	\N
f0a05059-a05e-4825-8463-54daf4026fbb	88289795-770a-41db-bb59-efa71443e0a1	1	20	2026-06-20 10:05:00	2026-06-06 11:20:00	AV4855	2	\N	realizado	1342156996655	\N	\N
c785396e-2253-41c7-85ab-efc04794db47	abd7414d-410a-4a01-b02f-b946547dd89d	20	23	2026-05-28 19:25:00	2026-05-28 20:09:00	8875	1	\N	realizado	\N	\N	\N
58384369-952c-4f64-9172-074ca599d3eb	cbd39029-a286-431a-8589-25f48bdd3c46	20	1	2026-06-01 11:50:00	2026-06-01 13:00:00	AV4854	1	4B	realizado	\N	\N	\N
ddbd2dd9-03f8-4993-833f-a6562a9807f4	cbd39029-a286-431a-8589-25f48bdd3c46	1	6	2026-06-01 14:10:00	2026-06-01 15:45:00	AV8582	2	6E	realizado	1342156750205	\N	\N
8a96c115-3ec0-4d5e-90f0-1ba7b338625c	08b0540b-5804-4ce5-90f4-dc75c582e9a6	20	23	2026-06-05 21:00:00	2026-06-05 21:50:00	8959	1	\N	realizado	\N	\N	\N
c6d82cb3-556f-48eb-9e81-494ea46c109f	88289795-770a-41db-bb59-efa71443e0a1	6	1	2026-06-06 06:25:00	2026-06-01 08:00:00	AV8419	1	\N	realizado	\N	\N	\N
f711e05b-81f4-463c-9c1d-4e9aef7bd3f5	c433b6f6-1c16-433a-940f-fca88ce5b6d4	20	23	2026-06-08 21:20:00	2026-06-08 22:10:00	8955	1	\N	realizado	\N	\N	\N
8da375f7-ebe7-4133-bbd9-401f07c1582d	dc779add-7bc3-4718-aee9-99b6257fc018	20	23	2026-06-12 09:25:00	2026-06-12 10:15:00	VE8947	1	10D	realizado	\N	\N	\N
39cc1bc6-f1c0-4cc7-b61e-ca18b782799f	2a9b4955-7ccc-43e0-aa4a-0e978b1d0292	1	20	2026-06-16 14:05:00	2026-06-16 16:40:00	AV4855	2	\N	realizado	1342157310068	\N	\N
a463b112-9e3a-4d56-979b-00c36c96c434	02b6cda7-7984-4e73-ad39-efae2ab53082	23	22	2026-06-13 17:10:00	2026-06-13 18:10:00	VE8986	1	11A	realizado	\N	\N	\N
3b31df9f-af76-4e11-bb1e-88e81a3a8c11	2a9b4955-7ccc-43e0-aa4a-0e978b1d0292	6	1	2026-06-16 10:05:00	2026-06-17 00:40:00	AV9531	1	\N	realizado	\N	\N	\N
5f3a346b-a48d-4a78-af9d-2ad6fffa91ac	64651cbf-db38-4268-aafd-ee7d9e28be08	6	1	2026-06-16 11:05:00	2026-06-16 12:40:00	AV9531	1	\N	realizado	\N	\N	\N
294fbaf9-c1d4-4085-a641-c36d3dfe3de1	ee39ef28-2af4-40c2-b85a-608b05bae61f	6	1	2026-06-16 11:05:00	2026-06-16 12:40:00	AV9531	1	\N	realizado	\N	\N	\N
8c2ea5b1-b012-4a11-83ea-4a1c757801e9	ee39ef28-2af4-40c2-b85a-608b05bae61f	1	20	2026-06-16 15:05:00	2026-06-16 16:20:00	AV4855	2	\N	realizado	1342157308810	\N	\N
ff912b6e-e108-4846-94f4-d5a852f244bb	64651cbf-db38-4268-aafd-ee7d9e28be08	1	20	2026-06-16 15:05:00	2026-06-16 16:20:00	AV4855	2	\N	realizado	1342157308809	\N	\N
e62f54df-2af1-45e9-b4ee-fac3a997cdc9	5146a1a5-4e1f-4817-b73d-3bbdbce7423f	23	40	2026-06-24 20:05:00	2026-06-24 21:00:00	VE897	2	\N	realizado	2460333334411	20	8
c56099c5-ab3a-426b-a658-a543f19996e3	d92dad1c-d501-43a9-a515-a2786101fd85	20	23	2026-06-14 14:25:00	2026-06-14 15:15:00	VE8947	1	\N	realizado	\N	\N	\N
aed7a87f-13f8-46a1-9642-576de2e3e109	ec452782-48df-47bc-91f7-9d56582090bf	20	23	2026-06-14 14:25:00	2026-06-14 15:15:00	VE8947	1	\N	realizado	\N	\N	\N
19bbd2e6-d5a3-4cfa-82ba-dd6fc2633f4f	6b3a34cd-828b-4e33-ac49-e218e9147a77	20	23	2026-06-17 18:30:00	2026-06-17 19:20:00	VE8951	1	\N	realizado	\N	\N	\N
c2474a24-b249-4be0-a2a8-2498b86a6d65	d9e867e3-3687-42e6-b9d9-4cc3b293e05d	2	22	2026-06-12 19:25:00	2026-06-12 20:25:00	AV9352	1	\N	realizado	\N	\N	\N
d44c0101-6535-4ab9-8107-3e40d35da688	6d377825-9213-45d2-8680-2b2c67b16b91	23	20	2026-06-17 20:35:00	2026-06-17 21:20:00	VE8954	1	\N	realizado	\N	\N	\N
5582f3a2-3514-491c-9900-5e19990b04ff	5146a1a5-4e1f-4817-b73d-3bbdbce7423f	20	23	2026-06-24 14:25:00	2026-06-24 15:15:00	VE8947	1	\N	realizado	\N	20	9
b95de457-0b81-46bb-97a2-ceaa492bdccf	6b3a34cd-828b-4e33-ac49-e218e9147a77	23	20	2026-06-19 20:00:00	2026-06-19 20:45:00	VE8958	2	\N	realizado	\N	\N	\N
48faa8d0-d47a-44fc-8266-3b75720d6bf2	3fd5a3f2-9480-4160-82b6-ce75539bf9b1	23	20	2026-06-22 13:25:00	2026-06-22 14:10:00	8946	3	\N	realizado	135609999	\N	\N
1c2d6020-26f3-4519-9262-0501364b0efb	cd8c27bb-caf2-45de-8315-f9d4b5933716	20	23	2026-06-25 16:25:00	2026-06-25 17:15:00	NEXUEO	1	\N	realizado	\N	20	7
69e46616-d72e-41da-8fd7-e6bfb9a8d13e	5108b30c-0c32-4f6b-b682-9a6e2f6cdce8	20	1	2026-06-27 16:50:00	2026-06-27 18:00:00	AV4854	1	\N	realizado	\N	1	37
810d9671-06bb-4d69-afde-37414b9c33b7	5108b30c-0c32-4f6b-b682-9a6e2f6cdce8	1	3	2026-06-27 20:10:00	2026-06-27 21:40:00	AV9758	2	\N	realizado	\N	1	37
e5f27499-d6dd-4e4e-af73-5fb9b1a08cb5	5146a1a5-4e1f-4817-b73d-3bbdbce7423f	40	23	2026-06-28 18:55:00	2026-06-28 19:50:00	VE897	3	\N	realizado	\N	20	8
32aeca09-1b63-4ba7-b1de-50f2c0f7c5a9	5146a1a5-4e1f-4817-b73d-3bbdbce7423f	23	20	2026-06-28 20:25:00	2026-06-28 21:10:00	VE8958	4	\N	realizado	2460333334412	20	8
37b10433-0be4-4791-bdee-cb3d62bbb7d9	e20fc50d-74c6-45c8-ac3e-fa679f401dbc	23	20	2026-06-03 13:25:00	2026-06-03 14:10:00	8946	1	8A	realizado	\N	20	7
f3da3a95-335a-4bed-a5ec-8484f456fb2d	fb1ebab6-2e91-4b29-82a3-f901a0805773	23	20	2026-06-26 15:30:00	2026-06-26 16:15:00	8950	1	\N	realizado	\N	20	8
b3354ef1-c688-4a3e-88f0-36b6709590c7	afb3207a-b218-4574-91f2-a61d638d0d6a	20	23	2026-06-30 13:40:00	2026-06-30 14:23:00	9R8671	1	\N	realizado	\N	14	31
89c19293-5e6b-4cc3-a1f2-506855a3e3ff	c65ab47d-2377-4a7c-99f3-4f13eb441178	4	1	2026-06-30 16:10:00	2026-06-30 17:10:00	AV8522	1	\N	realizado	\N	1	38
2a0de8fa-dbf0-4658-88dc-e81244d15f06	aec7074d-d63d-4382-bc7a-d167c4c32952	1	7	2026-07-01 19:25:00	2026-07-01 20:25:00	AV4847	1	\N	realizado	\N	1	1
2cf93b03-1747-432d-a682-d9943ef90ac2	d0611c31-a1f9-4351-8d2f-9fa167000448	53	4	2026-07-03 16:00:00	2026-07-03 17:00:00	4891	1	\N	pendiente	\N	21	42
3ea38d79-071c-4faf-bfe8-58e57d12221a	3abf52d2-92f6-4f5c-abe7-005455c0c7e9	40	23	2026-07-08 21:50:00	2026-07-08 22:42:00	8667	2	\N	pendiente	\N	14	6
854aee48-7d94-47c4-8d6a-00d4a9b89184	e7af4682-6704-45d9-a9dd-415484872b70	40	23	2026-07-08 21:50:00	2026-07-08 22:42:00	8667	2	\N	pendiente	\N	14	31
3bb9a92e-3ebd-43f6-a7ef-5e3a405e7abd	555ce73e-9446-4f1d-a196-d01d067e5999	40	23	2026-07-08 21:50:00	2026-07-08 22:42:00	8667	2	\N	pendiente	\N	14	31
8ccc7e3c-3002-420d-a29e-a61fd08a3219	3fdd22d3-aff4-450f-8919-0a5aa31c54ae	53	20	2026-07-18 14:10:00	2026-07-18 14:30:00	4762	2	\N	pendiente	\N	21	42
862a3a5c-b82d-4479-9f92-6aef00959da8	f15e29ae-3515-4087-bb78-4796bbe43c5e	7	23	2026-07-06 19:40:00	2026-07-06 20:25:00	VE9057	1	\N	realizado	\N	20	7
c3389d10-db47-4ad9-b15c-726203724f0f	ff7cb94e-8d86-4b03-874a-7af3774c876d	7	2	2026-07-06 20:35:00	2026-07-06 21:10:00	4352	1	\N	realizado	\N	2	3
90047978-b285-44df-84ad-1a9a756aa7e1	e7af4682-6704-45d9-a9dd-415484872b70	23	40	2026-07-07 17:10:00	2026-07-07 18:07:00	8006	1	\N	realizado	\N	14	31
5009a0f5-4f3a-4571-97bc-976c0b48c998	3abf52d2-92f6-4f5c-abe7-005455c0c7e9	23	40	2026-07-07 17:10:00	2026-07-08 18:07:00	8006	1	\N	realizado	\N	14	31
e9b2907d-173c-4796-ae98-fff82294d5e5	555ce73e-9446-4f1d-a196-d01d067e5999	23	40	2026-07-07 17:10:00	2026-07-07 18:07:00	8006	1	\N	realizado	\N	14	31
0d7eef2e-3735-4124-9c80-f8f56e7c673e	aeb74c2d-e4e5-46d5-bda5-68e4a6777d5c	23	20	2026-07-07 13:25:00	2026-07-07 14:10:00	VE8946	1	\N	realizado	\N	20	8
070a2b34-9870-4c6b-9a90-1e6551b84922	1f9fd65f-29a5-435f-85a4-dd8bfb3c23d8	23	20	2026-07-07 13:25:00	2026-07-07 14:10:00	VE8946	1	\N	realizado	\N	20	8
83f0df57-140d-4025-9170-23a0d4445442	3fdd22d3-aff4-450f-8919-0a5aa31c54ae	20	53	2026-07-08 15:00:00	2026-07-08 15:20:00	4707	1	\N	realizado	\N	21	42
ff7b16bf-0df2-454b-93ab-0da80835fd5a	4c37ab23-6dcc-493d-b47d-e1fe4b80c83f	23	75	2026-07-10 02:45:00	2026-07-10 03:50:00	VE9107	1	11D	realizado	\N	20	7
948a3d20-4819-4a6b-882f-6bfce379b7cb	9869a684-6833-4793-91ba-22ee42ffe9cf	1	4	2026-07-09 23:20:00	2026-07-10 00:25:00	4079	1	\N	realizado	\N	2	3
8347806c-fd90-424e-93d3-cffeaecf3943	b150b63c-233b-4a58-957b-dfd6cd485ed5	23	20	2026-07-12 15:10:00	2026-07-12 15:55:00	VE8948	1	\N	realizado	\N	20	7
f027b3c4-468d-4e75-b56a-23c841d09b10	8b565a94-d534-4abb-9429-d70beef2d7d2	76	2	2026-07-12 17:35:00	2026-07-12 20:45:00	AV269	1	\N	realizado	\N	1	38
76e484ed-b687-4849-b525-9a6558234a3a	ef9bcaba-17f0-4ed0-a3e7-dc20e91581b0	76	2	2026-07-12 17:35:00	2026-07-12 20:45:00	AV269	1	\N	realizado	\N	1	38
dd55b1b7-9b02-4497-a741-77f6e0aa5815	7d0f00de-c8dc-44d6-a2c3-1a5d0367d136	23	20	2026-07-13 12:05:00	2026-07-07 12:57:00	8670	1	\N	realizado	\N	14	31
a45d0860-46b9-45bd-8a03-7ffee60b1120	e82287f4-7498-4eca-925e-ffd05e7512f1	61	23	2026-07-17 14:10:00	2026-07-17 15:16:00	8893	1	\N	realizado	\N	14	31
43e1237a-8de3-4a70-9bfe-cd20d19d5448	e19bbb5e-4542-4464-9789-957dbb1d4070	23	20	2026-07-17 13:25:00	2026-07-17 14:10:00	8946	1	\N	realizado	\N	20	7
ef2de320-2964-4a4c-bdfb-f1c39820d30c	d07b5520-5a7f-4280-a8b4-822fdb7d23c0	53	20	2026-07-18 17:15:00	2026-07-18 18:00:00	7703	1	\N	realizado	\N	14	31
31989b7e-afda-4064-b1eb-61f488e88017	9bca864b-3724-401e-bfb3-f86e6f82f80f	53	4	2026-06-03 18:42:00	2026-06-03 20:11:00	6545	1	\N	pendiente	\N	14	31
7a8c3de1-3f80-4a6a-8a96-8cef780d5c9d	cbab4932-d4d5-44cf-a59c-7a9af8535748	23	20	2026-07-21 18:31:00	2026-07-21 19:23:00	8676	1	\N	realizado	\N	14	31
4e0f1e8f-bb6d-4c07-ae1f-027cb92de782	e19bbb5e-4542-4464-9789-957dbb1d4070	20	23	2026-07-22 16:30:00	2026-07-22 17:20:00	8949	2	\N	realizado	\N	20	7
beba866b-0ed8-4811-bc7b-49b644c61d32	fdf7937e-e16a-4e2c-bb09-648d5d62c608	77	14	2026-08-25 21:28:00	2026-08-26 00:55:00	361	3	\N	pendiente	\N	3	11
9d02969f-1acb-432b-ba8b-00fb4bc52301	fdf7937e-e16a-4e2c-bb09-648d5d62c608	14	2	2026-08-26 02:24:00	2026-09-26 03:50:00	155	4	\N	pendiente	\N	3	11
887c6ade-3ae0-44be-8ca2-cc1b317ab02e	fdf7937e-e16a-4e2c-bb09-648d5d62c608	2	14	2026-07-25 23:20:00	2026-07-26 00:46:00	157	1	\N	realizado	\N	3	11
c6342e1e-a4c1-4b40-98f7-00d79b449a78	fdf7937e-e16a-4e2c-bb09-648d5d62c608	14	77	2026-07-26 02:45:00	2026-07-26 04:07:00	182	2	\N	realizado	\N	3	11
ad6607ed-7b21-40d3-a640-970051713486	24c241c3-e3cd-4f95-ad58-9387560ba2a6	2	4	2026-07-26 02:50:00	2026-07-26 03:55:00	9439	1	\N	realizado	\N	1	37
0ba0662b-a6dc-4b08-9a72-279d1db148cf	da712178-7e5d-4aff-a5ad-bbf73b180ede	23	20	2026-07-26 18:30:00	2026-07-26 19:22:00	9R8676	1	\N	realizado	\N	14	31
058890ca-e304-4ede-8b1f-278058a9b423	97a6fb3c-5bbd-4018-827f-eb12a2aebefa	4	53	2026-05-30 16:15:00	2026-05-30 17:24:00	6544	1	\N	realizado	\N	14	31
c050abec-802f-441a-83f2-06a998574d2c	e4edfc1c-49ab-4885-baa6-af7f031e8ee9	23	20	2026-07-27 17:30:00	2026-07-27 18:15:00	VE8950	1	\N	realizado	\N	20	8
37f6aabd-c682-40fb-b9df-299be6edd3d7	0e5fb0bc-ea55-4744-bcf5-5295a2cf0f71	4	1	2026-07-31 01:35:00	2026-07-31 02:30:00	AV9384	1	\N	realizado	\N	1	38
f6dea43d-56ec-4bf3-905a-e9133a268fd5	a4532df7-a4e1-4a7a-8073-36f205df04c8	2	4	2026-07-26 02:50:00	2026-07-26 03:55:00	9439	1	\N	pendiente	\N	1	37
e9e47653-2904-4f1a-8249-83c22285cd42	d5236aec-5664-49f8-9c74-6de1a1ee9747	4	2	2026-07-31 01:35:00	2026-07-31 02:30:00	AV9384	1	26D	realizado	\N	1	38
b332b553-522e-406c-9041-0a86a528c52f	de94758d-3bed-41b1-ac9f-b71ad91be0b5	23	20	2026-08-02 18:40:00	2026-08-02 17:00:00	8676	1	\N	realizado	\N	14	31
f0befc6e-785b-4934-a1ca-64d9e4074a47	57c88441-c6fc-456b-903b-426cdec7336e	20	23	2026-08-03 19:15:00	2026-08-03 19:59:00	8875	1	\N	pendiente	\N	14	6
ca9fa332-1237-4de7-8ce1-88ae71a4f4ae	aed05cf9-fdad-4917-8d02-0478d287bfd9	20	23	2026-08-03 20:15:00	2026-08-03 19:59:00	8875	1	\N	pendiente	\N	14	6
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, persona_id, email, password_hash, rol_id, status, ultimo_login, creado_at) FROM stdin;
7	54	asesorsamtur01@gmail.com	$2b$12$CK7wbBSKp2OnGD4Es9jS0OU.3nwF0EN/s.j6/80v.qxxajgOb4Nra	2	active	2026-07-30 16:04:38.69	2026-07-03 18:27:06.884
4	5	angelikrivera19@gmail.com	$2b$12$iwRtQjwaZIEnJkph5AqesuXFCNP.3luOX9OOFkYhd3nt4VwK.O7Z.	1	active	2026-07-31 16:10:51.09	2026-06-09 23:35:51.935
1	1	admin@itea.com	$2b$12$69GiXmv2vSY0z78EcfjoQulHvuf779KExnVJZ02ksGBau.fHZ0BqK	1	active	2026-08-01 03:32:49.176	2026-05-21 17:17:06.975
8	56	diana.hernandez1979@hotmail.com	$2b$12$bGHwfJ1x7ALAS6M8Jm6bW.po0YjctqfGxTbukttC07piEYeSFC7tm	2	active	2026-07-03 22:35:28.367	2026-07-03 22:04:40.092
\.


--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ventas (id, cliente_id, usuario_id, monto_total, costo_proveedor_total, ta_total, comisionista_id, monto_comision_bruto, porcentaje_retencion_comision, monto_comision_neto, comision_liquidada, metodo_pago_principal_id, status, es_credito, fecha_vence_credito, monto_pagado_credito, observaciones, creado_at, deleted_at, is_reviewed, responsable_id, ta_cre_total) FROM stdin;
17	3	4	614840	519840	95000	\N	475	0	475	f	2	pagado	f	\N	0	TKT YA ESTA PAGO POR TRANSFERENCIA SE REALIZA ITEA POSTERIOR DEBIDO A QUE EL SISTEMA ESTA EN CONSTRUCCION	2026-06-14 01:25:28.971	\N	t	\N	0
70	6	4	617000	506120	110880	1	2217.6	19	1796.256	f	2	pagado	f	\N	0	IMPORTANTE: ESTE TKT FUERON EMITIDOS EL DIA 27 DE MAYO DEL AÑO VIGENTE. LOS PASAJEROS HACEN PARTE DEL COMÚN.\nOJO!!! -> VERIFCAR COMISION PAGADA POR VIAJES COLOMBIA ONLINE - OC 8957	2026-07-17 22:46:33.549	\N	f	\N	0
25	17	4	1096000	1010520	85480	\N	42.74	0	42.74	f	\N	pagado	f	2026-06-18 00:00:00	1096000	credito sandis	2026-06-17 21:44:53.311	\N	t	\N	0
27	19	4	2292000	2048756	243244	\N	243.244	0	243.244	f	\N	pagado	f	2026-06-25 00:00:00	2292000	Tiquete emitidos en multi trayectos	2026-06-18 19:31:53.552	\N	f	\N	0
55	34	4	517600	262800	254800	1	127400	0	127400	f	\N	credito	t	2026-07-16 00:00:00	0	alcaldia litoral del san  juan	2026-07-06 00:51:12.36	\N	f	4	0
59	38	4	545300	400300	145000	1	72500	0	72500	f	\N	credito	t	2026-07-15 00:00:00	0	creditos jhon jairo litoral	2026-07-07 01:48:06.212	\N	f	4	0
51	30	4	797096	565096	232000	1	23176.8	0	23176.8	f	\N	abonado	t	2026-07-16 00:00:00	500150		2026-07-04 18:29:49.503	\N	f	3	0
85	48	4	7758000	6946800	811200	1	202800	0	202800	f	2	pagado	f	\N	0	EL ITINERARIO PUEDE TENER ALGUNAS VARIACIONES DE LOS ITINERARIOS DEBIDO A QUE AUN FALTA MUCH0, ESTE DATO ES VARIABLE	2026-07-28 23:20:36.341	\N	f	\N	0
57	19	4	1280000	930100	349900	1	174915.01	0	174915.01	f	\N	pagado	f	2026-07-15 00:00:00	1280000	CREDITOS VICTOR ALZATE	2026-07-06 22:38:01.758	\N	t	2	0
63	34	4	1124000	680793	443207	1	265924.2	19	215398.602	f	\N	credito	t	2026-07-15 00:00:00	0	ALCALDE LITORAL	2026-07-09 22:02:49.935	\N	f	4	0
61	40	4	866352	466352	400000	\N	0	0	0	f	\N	pagado	f	2026-07-10 00:00:00	866352		2026-07-07 21:08:08.095	\N	f	2	0
67	43	7	267850	222850	45000	1	900	19	729	f	2	pagado	f	\N	0	Servicio de Niño Recomendado. \nRegistro de Venta realizado por: Bayrol Muñoz	2026-07-16 15:52:16.579	\N	f	\N	0
91	53	4	434500	387750	46750	\N	0	0	0	f	2	pagado	f	\N	0		2026-08-01 20:01:43.243	\N	f	\N	0
18	3	4	811110	726110	85000	\N	425	0	425	f	\N	pagado	f	2026-06-16 00:00:00	811110	tiquete pendiente por pagar	2026-06-14 01:36:16.674	\N	t	\N	0
26	18	4	425000	369800	55200	\N	0	0	0	f	\N	pagado	f	2026-06-19 00:00:00	425000	Tiquete con proveedor VIAJES COLOMBIA ONLINE	2026-06-18 17:51:44.904	\N	t	\N	0
89	50	4	589576	304576	85000	1	57000	0	57000	f	\N	credito	t	2026-08-02 00:00:00	0		2026-08-01 00:08:45.48	\N	f	4	200000
53	36	4	913000	678146	234854	1	46970.8	0	46970.8	f	\N	pagado	f	2026-07-06 00:00:00	913000	alcladia bahia solano chocó	2026-07-05 06:46:01.561	\N	t	5	0
19	12	4	830400	745400	85000	\N	85	0	85	f	\N	pagado	f	2026-06-16 00:00:00	830400	CREDITO SANDI	2026-06-14 04:37:56.955	\N	t	\N	0
20	13	4	485300	400300	85000	\N	255	0	255	f	\N	pagado	f	2026-06-21 00:00:00	485300	responsable del credito victor alzate amigo sandy	2026-06-14 19:10:34.986	\N	t	\N	0
87	50	4	867000	616630	250370	1	125159.963	0	125159.963	f	\N	credito	t	2026-08-04 00:00:00	0		2026-07-29 23:51:51.509	\N	f	4	0
65	42	4	752546	452546	300000	1	150000	0	150000	f	\N	pagado	f	2026-07-17 00:00:00	752546		2026-07-13 03:12:51.071	\N	t	2	0
3	4	4	750490	680490	70000	\N	0	0	0	f	\N	pagado	f	2026-06-16 00:00:00	750490	CREDITO SANDIS OC REALIZADA POR ANGELICA	2026-06-12 02:33:35.705	\N	t	\N	0
4	4	4	796900	726900	70000	\N	0	0	0	f	\N	pagado	f	2026-06-16 00:00:00	796900		2026-06-12 03:18:45.684	\N	t	\N	0
5	10	4	481000	346100	134900	\N	0	0	0	f	\N	pagado	f	2026-06-22 00:00:00	481000		2026-06-12 20:32:04.913	\N	t	\N	0
6	11	4	481000	346100	134900	\N	0	0	0	f	\N	pagado	f	2026-06-22 00:00:00	481000		2026-06-12 20:55:48.668	\N	t	\N	0
7	2	4	614840	519840	95000	\N	0	0	0	f	2	pagado	f	\N	0	tkt solicitado por sandis martinez ya esta pagado consignado a la cuenta de la empresa	2026-06-13 22:46:41.608	\N	t	\N	0
16	2	4	600000	549990	50010	\N	500.1	0	500.1	f	2	pagado	f	\N	0	tkt emitido para el gordo rf sandi martinez este tkt lo pago el gordo pero sandi debe reembolsar al gordo emitido por angelica rivera	2026-06-13 23:43:39.015	\N	t	\N	0
21	14	4	783800	698800	85000	\N	425	0	425	f	\N	pagado	f	2026-06-22 00:00:00	783800	credito victor	2026-06-16 17:09:08.485	\N	t	\N	0
22	4	4	687600	602600	85000	\N	0	0	0	f	\N	pagado	f	2026-06-17 00:00:00	687600	credito sandis martinez	2026-06-17 04:15:41.988	\N	t	\N	0
83	47	4	1735000	1203883	531117	1	323981.37	19	262424.9097	f	2	pagado	f	\N	0		2026-07-24 23:01:40.833	\N	t	\N	0
33	13	4	330000	204490	125510	\N	0	0	0	f	2	pagado	f	\N	0	OC 8941 VIAJES COLOMBIA RF VICTOR FECHA 28/05/2026	2026-06-18 23:34:46.784	\N	f	2	0
28	20	4	800000	647410	152590	\N	76.295	0	76.295	f	\N	pagado	f	2026-06-19 00:00:00	800000	OC 8899 VIAJES COLOMBIA. FECHA 19/05/2026   RF VICTOR ALZATE	2026-06-18 22:37:12.991	\N	f	\N	0
31	4	4	449000	393700	55300	\N	0	0	0	f	\N	pagado	f	2026-06-19 00:00:00	449000	OC 9042 REF SANDIS FECHA 08/06/2026 VIAJES COLOMBIA	2026-06-18 23:12:19.071	\N	f	1	0
32	9	4	253000	167850	85150	\N	0	0	0	f	\N	pagado	f	2026-06-19 00:00:00	253000	OC 8897 VIAJES COLOMBIA RF SANDIS FECHA 06/06/2026	2026-06-18 23:22:42.289	\N	f	1	0
30	4	4	347000	250900	96100	\N	0	0	0	f	\N	pagado	f	2026-06-19 00:00:00	347000	OC 8895  RF SANDIS . FECHA 19/05/2026 VIAJES COLOMBIA	2026-06-18 23:06:41.03	\N	f	1	0
34	21	4	277000	186450	90550	\N	0	0	0	f	2	pagado	f	\N	0	OC 8898 VIAJES COLOMBIA RF VICTOR FECHA  EMISION 19/05/2026	2026-06-18 23:50:34.641	\N	f	\N	0
35	21	4	301000	215450	85550	\N	0	0	0	f	2	pagado	f	\N	0	OC 8956 VIAJES COLOMBIA RF VICTOR  FECHA 27/05/2026	2026-06-18 23:58:23.63	\N	f	\N	0
68	44	7	365000	315000	50000	1	1000	19	810	f	2	pagado	f	\N	0		2026-07-16 19:53:13.526	\N	f	\N	0
40	29	4	335900	250900	85000	\N	0	0	0	f	\N	pagado	f	2026-06-29 00:00:00	335900	TIQUETE EMITIDO DIRECTAMENTE CON CLIC DE  SAMTUR CREDITO PARA VICTOR ALZATE	2026-06-24 06:02:41.76	\N	t	2	0
46	32	4	1302852	1202852	100000	\N	0	0	0	f	\N	pagado	f	2026-07-01 00:00:00	1302852	tkts emitidos ór angelica	2026-06-29 22:13:46.525	\N	t	1	0
52	34	4	912175	678146	234029	1	46805.8	0	46805.8	f	\N	pagado	f	2026-07-16 00:00:00	912175	alcalde litoral del san juan	2026-07-04 19:26:11.629	\N	t	4	0
47	34	4	923730	723730	200000	1	100000	0	100000	f	\N	pagado	f	2026-07-20 00:00:00	923730		2026-06-30 02:12:26.022	\N	t	4	0
42	20	4	498000	413000	85000	\N	0	0	0	f	\N	pagado	f	2026-06-30 00:00:00	498000	servicio menor recomendado, al responsable se le cobra la totalidad del costo del tiquete incluyendo el cobro de menor recomendado a la aerolinea.	2026-06-24 23:50:30.852	\N	t	2	0
73	45	4	409750	365750	44000	1	880	18	721.6	f	2	pagado	f	\N	0		2026-07-18 19:41:54.58	\N	t	\N	0
45	31	1	963000	824480	138520	\N	0	0	0	f	\N	pagado	f	2026-06-30 00:00:00	963000	TKT emitido por Bayrol Muñoz, supervisado por la Jefe Angelica Rivera	2026-06-26 23:09:15.88	\N	t	2	0
71	7	4	423000	368000	55000	1	1100	19	891.0000000000001	f	2	pagado	f	\N	0	IMPORTANTE: ESTE TKT FUERON EMITIDOS EL DIA 02 DE JUNIODEL AÑO VIGENTE. EL PASAJERO HACE PARTE DEL COMÚN.\nOJO!!! -> VERIFCAR COMISION PAGADA POR VIAJES COLOMBIA ONLINE - OC 9014	2026-07-17 22:52:22.504	\N	f	\N	0
54	37	4	942600	700500	242100	1	121050	0	121050	f	\N	credito	t	2026-07-16 00:00:00	0	alcaldia juradó denio jimenez	2026-07-06 00:12:38.225	\N	f	3	0
56	38	4	1087386	687386	400000	1	199960	0	199960	f	\N	credito	t	2026-07-07 00:00:00	0	creditos jhon jairo litoral	2026-07-06 18:01:06.88	\N	f	4	0
60	39	4	592900	447900	145000	1	72500	0	72500	f	\N	credito	t	2026-07-15 00:00:00	0	credito jhon jairo litoral	2026-07-07 02:00:00.026	\N	f	4	0
62	34	4	400400	150400	250000	1	125000	19	101250	f	\N	credito	t	2026-07-12 00:00:00	0	Hecho por Bayrol Muñoz.	2026-07-08 23:42:59.37	\N	f	4	0
50	30	4	530350	405350	125000	1	12487.5	0	12487.5	f	\N	pagado	f	2026-07-30 00:00:00	530350	este tkt reemplaza uno que se realizo con colombia on line por katerine, pero me equivoque de ruta, angelica solicita a viajes colombia on line dejar el cupo abierto para qu el doctor denio lo reutilice	2026-07-03 02:21:16.521	\N	f	3	0
66	37	4	519000	369000	150000	1	75000	0	75000	f	\N	credito	t	2026-07-25 00:00:00	0	TKT COMPRADO A VIAJES COLOMBIA ON LINE ACUERDO COMERCIAL EN TA	2026-07-15 00:11:46.699	\N	f	\N	0
82	46	4	188850	168850	20000	\N	0	0	0	f	\N	credito	t	2026-07-31 00:00:00	0	TKT de viaje de negocios de la jefe Angelica.	2026-07-23 22:44:49.138	\N	f	1	0
86	50	4	867000	616300	250700	1	125350	0	125350	f	\N	anulado	t	2026-08-03 00:00:00	0	[ANULADA] Motivo: se anula este itea debido a que el destino quedó mal dijitado 	2026-07-29 21:44:11.19	\N	f	4	0
58	40	4	1280000	930100	349900	1	174950	0	174950	f	\N	pagado	f	2026-07-15 00:00:00	1280000	CREDITO VICTOR ALZATE	2026-07-06 22:45:40.742	\N	t	2	0
43	23	4	6235000	5749305	485695	\N	0	0	0	f	2	pagado	f	\N	0		2026-06-25 21:36:21.689	\N	f	\N	0
64	41	4	339300	227750	111550	\N	0	0	0	f	\N	pagado	f	2026-07-15 00:00:00	678600	credito san	2026-07-10 04:21:14.597	\N	t	1	0
84	30	4	900000	577266	80683	1	161367	0	161367	f	1	anulado	f	\N	0	pago de contado\n[ANULADA] Motivo: Anulada por equivocación al ingresar datos	2026-07-25 19:14:47.776	\N	t	\N	242051
24	16	4	1096360	1010520	85840	\N	42.92	0	42.92	f	\N	pagado	f	2026-06-18 00:00:00	1096360	credito  sandis	2026-06-17 21:37:05.451	\N	t	\N	0
90	54	4	434500	387750	46750	\N	0	0	0	f	2	pagado	f	\N	0		2026-08-01 19:57:31.711	\N	f	4	0
88	30	4	900000	577266	80683	1	161367	0	161367	f	1	pagado	f	\N	0	Pago de contado	2026-07-30 12:24:18.847	\N	f	\N	242051
23	15	4	1096000	1010520	85480	\N	42.74	0	42.74	f	\N	pagado	f	2026-06-18 00:00:00	1096000	creditos sandis.	2026-06-17 21:26:53.884	\N	t	\N	0
29	4	4	334000	233176	100824	\N	0	0	0	f	\N	pagado	f	2026-06-19 00:00:00	334000		2026-06-18 22:57:50.923	\N	t	1	0
36	10	4	1266800	1096800	170000	\N	0	0	0	f	\N	pagado	f	2026-06-20 00:00:00	1266800		2026-06-19 04:14:49.882	\N	t	2	0
38	27	4	3420800	3120800	300000	\N	0	0	0	f	2	pagado	f	\N	0	clientes nuevos recomendados por sandis gabriel	2026-06-23 21:09:25.62	\N	t	\N	0
44	4	4	490726	405726	85000	\N	0	0	0	f	\N	pagado	f	2026-06-30 00:00:00	490726	tkt realizado el dia 2 de Junio, en la noche. No se había realizado el ingreso debido a que no se había terminado el sistema iTea	2026-06-26 17:41:46.636	\N	t	1	0
48	34	4	664000	464000	200000	1	40000	0	40000	f	\N	pagado	f	2026-07-20 00:00:00	664000		2026-07-01 17:39:23.568	\N	t	4	0
\.


--
-- Data for Name: ventas_mensuales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ventas_mensuales (id, year, month, total, count, hoteles, vuelos, paquetes, seguros, transferencias) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-05-21 09:33:29
20211116045059	2026-05-21 09:33:29
20211116050929	2026-05-21 09:33:29
20211116051442	2026-05-21 09:33:29
20211116212300	2026-05-21 09:33:30
20211116213355	2026-05-21 09:33:30
20211116213934	2026-05-21 09:33:30
20211116214523	2026-05-21 09:33:30
20211122062447	2026-05-21 09:33:31
20211124070109	2026-05-21 09:33:31
20211202204204	2026-05-21 09:33:31
20211202204605	2026-05-21 09:33:31
20211210212804	2026-05-21 09:33:32
20211228014915	2026-05-21 09:33:32
20220107221237	2026-05-21 09:33:32
20220228202821	2026-05-21 09:33:32
20220312004840	2026-05-21 09:33:33
20220603231003	2026-05-21 09:33:33
20220603232444	2026-05-21 09:33:33
20220615214548	2026-05-21 09:33:33
20220712093339	2026-05-21 09:33:34
20220908172859	2026-05-21 09:33:34
20220916233421	2026-05-21 09:33:34
20230119133233	2026-05-21 09:33:34
20230128025114	2026-05-21 09:33:34
20230128025212	2026-05-21 09:33:35
20230227211149	2026-05-21 09:33:35
20230228184745	2026-05-21 09:33:35
20230308225145	2026-05-21 09:33:35
20230328144023	2026-05-21 09:33:35
20231018144023	2026-05-21 09:33:36
20231204144023	2026-05-21 09:33:36
20231204144024	2026-05-21 09:33:36
20231204144025	2026-05-21 09:33:36
20240108234812	2026-05-21 09:33:37
20240109165339	2026-05-21 09:33:37
20240227174441	2026-05-21 09:33:37
20240311171622	2026-05-21 09:33:37
20240321100241	2026-05-21 09:33:38
20240401105812	2026-05-21 09:33:38
20240418121054	2026-05-21 09:33:39
20240523004032	2026-05-21 09:33:39
20240618124746	2026-05-21 09:33:40
20240801235015	2026-05-21 09:33:40
20240805133720	2026-05-21 09:33:40
20240827160934	2026-05-21 09:33:40
20240919163303	2026-05-21 09:33:40
20240919163305	2026-05-21 09:33:41
20241019105805	2026-05-21 09:33:41
20241030150047	2026-05-21 09:33:42
20241108114728	2026-05-21 09:33:42
20241121104152	2026-05-21 09:33:42
20241130184212	2026-05-21 09:33:42
20241220035512	2026-05-21 09:33:42
20241220123912	2026-05-21 09:33:43
20241224161212	2026-05-21 09:33:43
20250107150512	2026-05-21 09:33:43
20250110162412	2026-05-21 09:33:43
20250123174212	2026-05-21 09:33:43
20250128220012	2026-05-21 09:33:44
20250506224012	2026-05-21 09:33:44
20250523164012	2026-05-21 09:33:44
20250714121412	2026-05-21 09:33:44
20250905041441	2026-05-21 09:33:44
20251103001201	2026-05-21 09:33:45
20251120212548	2026-05-21 09:33:45
20251120215549	2026-05-21 09:33:45
20260218120000	2026-05-21 09:33:45
20260326120000	2026-05-21 09:33:46
20260514120000	2026-06-05 14:59:31
20260527120000	2026-06-05 14:59:31
20260528120000	2026-06-05 14:59:31
20260603120000	2026-06-05 14:59:32
20260605120000	2026-06-18 03:24:51
20260606110000	2026-06-18 03:24:51
20260616120000	2026-07-03 18:27:56
20260624120000	2026-07-03 18:27:57
20260626120000	2026-07-03 18:27:58
20260706120000	2026-07-07 03:07:00
20260707120000	2026-07-14 21:53:38
20260709120000	2026-07-14 21:53:39
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-05-21 09:33:27.428706
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-05-21 09:33:27.454303
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-05-21 09:33:27.463374
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-05-21 09:33:27.487953
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-05-21 09:33:27.504368
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-05-21 09:33:27.508332
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-05-21 09:33:27.513258
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-05-21 09:33:27.517829
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-05-21 09:33:27.521591
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-05-21 09:33:27.525751
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-05-21 09:33:27.529643
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-05-21 09:33:27.536434
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-05-21 09:33:27.541861
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-05-21 09:33:27.545916
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-05-21 09:33:27.550239
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-05-21 09:33:27.583447
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-05-21 09:33:27.587443
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-05-21 09:33:27.591092
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-05-21 09:33:27.594748
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-05-21 09:33:27.604721
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-05-21 09:33:27.608813
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-05-21 09:33:27.614281
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-05-21 09:33:27.637122
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-05-21 09:33:27.649049
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-05-21 09:33:27.653282
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-05-21 09:33:27.657014
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-05-21 09:33:27.661231
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-05-21 09:33:27.664915
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-05-21 09:33:27.668498
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-05-21 09:33:27.671857
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-05-21 09:33:27.675071
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-05-21 09:33:27.678449
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-05-21 09:33:27.681866
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-05-21 09:33:27.685106
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-05-21 09:33:27.688369
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-05-21 09:33:27.691634
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-05-21 09:33:27.694845
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-05-21 09:33:27.698482
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-05-21 09:33:27.70319
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-05-21 09:33:27.713863
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-05-21 09:33:27.717308
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-05-21 09:33:27.720592
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-05-21 09:33:27.724851
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-05-21 09:33:27.728233
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-05-21 09:33:27.731618
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-05-21 09:33:27.735792
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-05-21 09:33:27.746462
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-05-21 09:33:27.750468
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-05-21 09:33:27.753945
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-05-21 09:33:27.772075
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-05-21 09:33:27.777816
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-05-21 09:33:27.795969
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-05-21 09:33:27.797298
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-05-21 09:33:27.808579
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-05-21 09:33:27.811054
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-05-21 09:33:27.812416
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-05-21 09:33:27.817739
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-05-21 09:33:27.823471
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-05-21 09:33:27.827596
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-05-21 09:33:27.832142
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-05-21 09:33:27.836717
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: aerolineas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.aerolineas_id_seq', 27, true);


--
-- Name: aeropuertos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.aeropuertos_id_seq', 77, true);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clientes_id_seq', 54, true);


--
-- Name: comisionistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.comisionistas_id_seq', 2, true);


--
-- Name: liquidacion_ventas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.liquidacion_ventas_id_seq', 1, false);


--
-- Name: liquidaciones_comision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.liquidaciones_comision_id_seq', 1, false);


--
-- Name: logs_usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.logs_usuarios_id_seq', 1, false);


--
-- Name: metodos_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.metodos_pago_id_seq', 14, true);


--
-- Name: paquete_asistencia_medica_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paquete_asistencia_medica_id_seq', 1, false);


--
-- Name: paquete_hotel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paquete_hotel_id_seq', 1, true);


--
-- Name: paquete_proveedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paquete_proveedor_id_seq', 1, true);


--
-- Name: paquete_tarifas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paquete_tarifas_id_seq', 1, false);


--
-- Name: paquete_vuelo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paquete_vuelo_id_seq', 1, true);


--
-- Name: paquetes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paquetes_id_seq', 1, true);


--
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permisos_id_seq', 32, true);


--
-- Name: permisos_rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permisos_rol_id_seq', 536, true);


--
-- Name: permisos_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permisos_usuario_id_seq', 28, true);


--
-- Name: personas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personas_id_seq', 79, true);


--
-- Name: politicas_equipaje_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.politicas_equipaje_id_seq', 44, true);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 32, true);


--
-- Name: responsables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.responsables_id_seq', 5, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: tarjetas_agencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tarjetas_agencia_id_seq', 3, true);


--
-- Name: tipos_documento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_documento_id_seq', 10, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 8, true);


--
-- Name: ventas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ventas_id_seq', 91, true);


--
-- Name: ventas_mensuales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ventas_mensuales_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: aerolineas aerolineas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aerolineas
    ADD CONSTRAINT aerolineas_pkey PRIMARY KEY (id);


--
-- Name: aeropuertos aeropuertos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aeropuertos
    ADD CONSTRAINT aeropuertos_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: comisionistas comisionistas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comisionistas
    ADD CONSTRAINT comisionistas_pkey PRIMARY KEY (id);


--
-- Name: detalle_venta detalle_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_pkey PRIMARY KEY (id);


--
-- Name: liquidacion_ventas liquidacion_ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion_ventas
    ADD CONSTRAINT liquidacion_ventas_pkey PRIMARY KEY (id);


--
-- Name: liquidaciones_comision liquidaciones_comision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidaciones_comision
    ADD CONSTRAINT liquidaciones_comision_pkey PRIMARY KEY (id);


--
-- Name: logs_usuarios logs_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_usuarios
    ADD CONSTRAINT logs_usuarios_pkey PRIMARY KEY (id);


--
-- Name: metodos_pago metodos_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodos_pago
    ADD CONSTRAINT metodos_pago_pkey PRIMARY KEY (id);


--
-- Name: pagos_venta pagos_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_venta
    ADD CONSTRAINT pagos_venta_pkey PRIMARY KEY (id);


--
-- Name: paquete_asistencia_medica paquete_asistencia_medica_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_asistencia_medica
    ADD CONSTRAINT paquete_asistencia_medica_pkey PRIMARY KEY (id);


--
-- Name: paquete_hotel paquete_hotel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_hotel
    ADD CONSTRAINT paquete_hotel_pkey PRIMARY KEY (id);


--
-- Name: paquete_proveedor paquete_proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_proveedor
    ADD CONSTRAINT paquete_proveedor_pkey PRIMARY KEY (id);


--
-- Name: paquete_tarifas paquete_tarifas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_tarifas
    ADD CONSTRAINT paquete_tarifas_pkey PRIMARY KEY (id);


--
-- Name: paquete_vuelo paquete_vuelo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_vuelo
    ADD CONSTRAINT paquete_vuelo_pkey PRIMARY KEY (id);


--
-- Name: paquetes paquetes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT paquetes_pkey PRIMARY KEY (id);


--
-- Name: pasajeros_detalle pasajeros_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pasajeros_detalle
    ADD CONSTRAINT pasajeros_detalle_pkey PRIMARY KEY (id);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);


--
-- Name: permisos_rol permisos_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_rol
    ADD CONSTRAINT permisos_rol_pkey PRIMARY KEY (id);


--
-- Name: permisos_usuario permisos_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_usuario
    ADD CONSTRAINT permisos_usuario_pkey PRIMARY KEY (id);


--
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id);


--
-- Name: politicas_equipaje politicas_equipaje_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_equipaje
    ADD CONSTRAINT politicas_equipaje_pkey PRIMARY KEY (id);


--
-- Name: prod_autos prod_autos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_autos
    ADD CONSTRAINT prod_autos_pkey PRIMARY KEY (id);


--
-- Name: prod_checkins prod_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_checkins
    ADD CONSTRAINT prod_checkins_pkey PRIMARY KEY (id);


--
-- Name: prod_equipajes prod_equipajes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_equipajes
    ADD CONSTRAINT prod_equipajes_pkey PRIMARY KEY (id);


--
-- Name: prod_eventos prod_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_eventos
    ADD CONSTRAINT prod_eventos_pkey PRIMARY KEY (id);


--
-- Name: prod_fincas prod_fincas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_fincas
    ADD CONSTRAINT prod_fincas_pkey PRIMARY KEY (id);


--
-- Name: prod_hoteleria prod_hoteleria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_hoteleria
    ADD CONSTRAINT prod_hoteleria_pkey PRIMARY KEY (id);


--
-- Name: prod_mascotas prod_mascotas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_mascotas
    ADD CONSTRAINT prod_mascotas_pkey PRIMARY KEY (id);


--
-- Name: prod_migracion prod_migracion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_migracion
    ADD CONSTRAINT prod_migracion_pkey PRIMARY KEY (id);


--
-- Name: prod_pasaportes prod_pasaportes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_pasaportes
    ADD CONSTRAINT prod_pasaportes_pkey PRIMARY KEY (id);


--
-- Name: prod_planes prod_planes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_planes
    ADD CONSTRAINT prod_planes_pkey PRIMARY KEY (id);


--
-- Name: prod_restaurantes prod_restaurantes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_restaurantes
    ADD CONSTRAINT prod_restaurantes_pkey PRIMARY KEY (id);


--
-- Name: prod_seguros prod_seguros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_seguros
    ADD CONSTRAINT prod_seguros_pkey PRIMARY KEY (id);


--
-- Name: prod_simcards prod_simcards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_simcards
    ADD CONSTRAINT prod_simcards_pkey PRIMARY KEY (id);


--
-- Name: prod_tiqueteria prod_tiqueteria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_tiqueteria
    ADD CONSTRAINT prod_tiqueteria_pkey PRIMARY KEY (id);


--
-- Name: prod_tours prod_tours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_tours
    ADD CONSTRAINT prod_tours_pkey PRIMARY KEY (id);


--
-- Name: prod_visas prod_visas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_visas
    ADD CONSTRAINT prod_visas_pkey PRIMARY KEY (id);


--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- Name: responsables responsables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsables
    ADD CONSTRAINT responsables_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id);


--
-- Name: tarjetas_agencia tarjetas_agencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tarjetas_agencia
    ADD CONSTRAINT tarjetas_agencia_pkey PRIMARY KEY (id);


--
-- Name: tipos_documento tipos_documento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_documento
    ADD CONSTRAINT tipos_documento_pkey PRIMARY KEY (id);


--
-- Name: tramos_vuelo tramos_vuelo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tramos_vuelo
    ADD CONSTRAINT tramos_vuelo_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ventas_mensuales ventas_mensuales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas_mensuales
    ADD CONSTRAINT ventas_mensuales_pkey PRIMARY KEY (id);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: aerolineas_codigo_iata_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX aerolineas_codigo_iata_key ON public.aerolineas USING btree (codigo_iata);


--
-- Name: aeropuertos_codigo_iata_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX aeropuertos_codigo_iata_key ON public.aeropuertos USING btree (codigo_iata);


--
-- Name: clientes_persona_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX clientes_persona_id_key ON public.clientes USING btree (persona_id);


--
-- Name: comisionistas_persona_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX comisionistas_persona_id_key ON public.comisionistas USING btree (persona_id);


--
-- Name: detalle_venta_metodo_pago_proveedor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX detalle_venta_metodo_pago_proveedor_id_idx ON public.detalle_venta USING btree (metodo_pago_proveedor_id);


--
-- Name: detalle_venta_proveedor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX detalle_venta_proveedor_id_idx ON public.detalle_venta USING btree (proveedor_id);


--
-- Name: detalle_venta_venta_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX detalle_venta_venta_id_idx ON public.detalle_venta USING btree (venta_id);


--
-- Name: liquidacion_ventas_liquidacion_id_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX liquidacion_ventas_liquidacion_id_venta_id_key ON public.liquidacion_ventas USING btree (liquidacion_id, venta_id);


--
-- Name: metodos_pago_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX metodos_pago_nombre_key ON public.metodos_pago USING btree (nombre);


--
-- Name: pagos_venta_venta_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pagos_venta_venta_id_idx ON public.pagos_venta USING btree (venta_id);


--
-- Name: paquete_asistencia_medica_paquete_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX paquete_asistencia_medica_paquete_id_key ON public.paquete_asistencia_medica USING btree (paquete_id);


--
-- Name: pasajeros_detalle_detalle_venta_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pasajeros_detalle_detalle_venta_id_idx ON public.pasajeros_detalle USING btree (detalle_venta_id);


--
-- Name: pasajeros_detalle_persona_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pasajeros_detalle_persona_id_idx ON public.pasajeros_detalle USING btree (persona_id);


--
-- Name: permisos_rol_rol_id_permiso_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permisos_rol_rol_id_permiso_id_key ON public.permisos_rol USING btree (rol_id, permiso_id);


--
-- Name: permisos_usuario_usuario_id_permiso_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permisos_usuario_usuario_id_permiso_id_key ON public.permisos_usuario USING btree (usuario_id, permiso_id);


--
-- Name: personas_documento_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX personas_documento_key ON public.personas USING btree (documento);


--
-- Name: prod_autos_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_autos_detalle_venta_id_key ON public.prod_autos USING btree (detalle_venta_id);


--
-- Name: prod_checkins_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_checkins_detalle_venta_id_key ON public.prod_checkins USING btree (detalle_venta_id);


--
-- Name: prod_equipajes_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_equipajes_detalle_venta_id_key ON public.prod_equipajes USING btree (detalle_venta_id);


--
-- Name: prod_eventos_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_eventos_detalle_venta_id_key ON public.prod_eventos USING btree (detalle_venta_id);


--
-- Name: prod_fincas_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_fincas_detalle_venta_id_key ON public.prod_fincas USING btree (detalle_venta_id);


--
-- Name: prod_hoteleria_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_hoteleria_detalle_venta_id_key ON public.prod_hoteleria USING btree (detalle_venta_id);


--
-- Name: prod_mascotas_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_mascotas_detalle_venta_id_key ON public.prod_mascotas USING btree (detalle_venta_id);


--
-- Name: prod_migracion_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_migracion_detalle_venta_id_key ON public.prod_migracion USING btree (detalle_venta_id);


--
-- Name: prod_pasaportes_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_pasaportes_detalle_venta_id_key ON public.prod_pasaportes USING btree (detalle_venta_id);


--
-- Name: prod_planes_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_planes_detalle_venta_id_key ON public.prod_planes USING btree (detalle_venta_id);


--
-- Name: prod_restaurantes_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_restaurantes_detalle_venta_id_key ON public.prod_restaurantes USING btree (detalle_venta_id);


--
-- Name: prod_seguros_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_seguros_detalle_venta_id_key ON public.prod_seguros USING btree (detalle_venta_id);


--
-- Name: prod_simcards_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_simcards_detalle_venta_id_key ON public.prod_simcards USING btree (detalle_venta_id);


--
-- Name: prod_tiqueteria_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_tiqueteria_detalle_venta_id_key ON public.prod_tiqueteria USING btree (detalle_venta_id);


--
-- Name: prod_tours_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_tours_detalle_venta_id_key ON public.prod_tours USING btree (detalle_venta_id);


--
-- Name: prod_visas_detalle_venta_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prod_visas_detalle_venta_id_key ON public.prod_visas USING btree (detalle_venta_id);


--
-- Name: responsables_persona_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX responsables_persona_id_key ON public.responsables USING btree (persona_id);


--
-- Name: roles_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_nombre_key ON public.roles USING btree (nombre);


--
-- Name: tipos_documento_abreviatura_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tipos_documento_abreviatura_key ON public.tipos_documento USING btree (abreviatura);


--
-- Name: tramos_vuelo_aeropuerto_destino_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tramos_vuelo_aeropuerto_destino_id_idx ON public.tramos_vuelo USING btree (aeropuerto_destino_id);


--
-- Name: tramos_vuelo_aeropuerto_origen_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tramos_vuelo_aeropuerto_origen_id_idx ON public.tramos_vuelo USING btree (aeropuerto_origen_id);


--
-- Name: tramos_vuelo_prod_tiqueteria_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tramos_vuelo_prod_tiqueteria_id_idx ON public.tramos_vuelo USING btree (prod_tiqueteria_id);


--
-- Name: usuarios_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);


--
-- Name: usuarios_persona_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_persona_id_key ON public.usuarios USING btree (persona_id);


--
-- Name: ventas_cliente_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventas_cliente_id_idx ON public.ventas USING btree (cliente_id);


--
-- Name: ventas_comisionista_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventas_comisionista_id_idx ON public.ventas USING btree (comisionista_id);


--
-- Name: ventas_mensuales_year_month_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ventas_mensuales_year_month_key ON public.ventas_mensuales USING btree (year, month);


--
-- Name: ventas_usuario_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventas_usuario_id_idx ON public.ventas USING btree (usuario_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: clientes clientes_creado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_creado_por_id_fkey FOREIGN KEY (creado_por_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clientes clientes_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: comisionistas comisionistas_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comisionistas
    ADD CONSTRAINT comisionistas_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: detalle_venta detalle_venta_metodo_pago_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_metodo_pago_proveedor_id_fkey FOREIGN KEY (metodo_pago_proveedor_id) REFERENCES public.metodos_pago(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detalle_venta detalle_venta_parent_detalle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_parent_detalle_id_fkey FOREIGN KEY (parent_detalle_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detalle_venta detalle_venta_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detalle_venta detalle_venta_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT detalle_venta_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: liquidacion_ventas liquidacion_ventas_liquidacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion_ventas
    ADD CONSTRAINT liquidacion_ventas_liquidacion_id_fkey FOREIGN KEY (liquidacion_id) REFERENCES public.liquidaciones_comision(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: liquidacion_ventas liquidacion_ventas_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidacion_ventas
    ADD CONSTRAINT liquidacion_ventas_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: liquidaciones_comision liquidaciones_comision_comisionista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidaciones_comision
    ADD CONSTRAINT liquidaciones_comision_comisionista_id_fkey FOREIGN KEY (comisionista_id) REFERENCES public.comisionistas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: liquidaciones_comision liquidaciones_comision_metodo_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidaciones_comision
    ADD CONSTRAINT liquidaciones_comision_metodo_pago_id_fkey FOREIGN KEY (metodo_pago_id) REFERENCES public.metodos_pago(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: logs_usuarios logs_usuarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_usuarios
    ADD CONSTRAINT logs_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pagos_venta pagos_venta_metodo_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_venta
    ADD CONSTRAINT pagos_venta_metodo_pago_id_fkey FOREIGN KEY (metodo_pago_id) REFERENCES public.metodos_pago(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pagos_venta pagos_venta_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos_venta
    ADD CONSTRAINT pagos_venta_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paquete_asistencia_medica paquete_asistencia_medica_paquete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_asistencia_medica
    ADD CONSTRAINT paquete_asistencia_medica_paquete_id_fkey FOREIGN KEY (paquete_id) REFERENCES public.paquetes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paquete_hotel paquete_hotel_paquete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_hotel
    ADD CONSTRAINT paquete_hotel_paquete_id_fkey FOREIGN KEY (paquete_id) REFERENCES public.paquetes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paquete_proveedor paquete_proveedor_paquete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_proveedor
    ADD CONSTRAINT paquete_proveedor_paquete_id_fkey FOREIGN KEY (paquete_id) REFERENCES public.paquetes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paquete_proveedor paquete_proveedor_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_proveedor
    ADD CONSTRAINT paquete_proveedor_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paquete_tarifas paquete_tarifas_paquete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_tarifas
    ADD CONSTRAINT paquete_tarifas_paquete_id_fkey FOREIGN KEY (paquete_id) REFERENCES public.paquetes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paquete_vuelo paquete_vuelo_aerolinea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_vuelo
    ADD CONSTRAINT paquete_vuelo_aerolinea_id_fkey FOREIGN KEY (aerolinea_id) REFERENCES public.aerolineas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: paquete_vuelo paquete_vuelo_paquete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquete_vuelo
    ADD CONSTRAINT paquete_vuelo_paquete_id_fkey FOREIGN KEY (paquete_id) REFERENCES public.paquetes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paquetes paquetes_creado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT paquetes_creado_por_id_fkey FOREIGN KEY (creado_por_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pasajeros_detalle pasajeros_detalle_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pasajeros_detalle
    ADD CONSTRAINT pasajeros_detalle_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pasajeros_detalle pasajeros_detalle_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pasajeros_detalle
    ADD CONSTRAINT pasajeros_detalle_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: permisos_rol permisos_rol_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_rol
    ADD CONSTRAINT permisos_rol_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: permisos_rol permisos_rol_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_rol
    ADD CONSTRAINT permisos_rol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: permisos_usuario permisos_usuario_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_usuario
    ADD CONSTRAINT permisos_usuario_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: permisos_usuario permisos_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos_usuario
    ADD CONSTRAINT permisos_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: personas personas_tipo_documento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_tipo_documento_id_fkey FOREIGN KEY (tipo_documento_id) REFERENCES public.tipos_documento(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: politicas_equipaje politicas_equipaje_aerolinea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_equipaje
    ADD CONSTRAINT politicas_equipaje_aerolinea_id_fkey FOREIGN KEY (aerolinea_id) REFERENCES public.aerolineas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_autos prod_autos_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_autos
    ADD CONSTRAINT prod_autos_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_checkins prod_checkins_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_checkins
    ADD CONSTRAINT prod_checkins_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_equipajes prod_equipajes_aerolinea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_equipajes
    ADD CONSTRAINT prod_equipajes_aerolinea_id_fkey FOREIGN KEY (aerolinea_id) REFERENCES public.aerolineas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: prod_equipajes prod_equipajes_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_equipajes
    ADD CONSTRAINT prod_equipajes_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_eventos prod_eventos_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_eventos
    ADD CONSTRAINT prod_eventos_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_fincas prod_fincas_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_fincas
    ADD CONSTRAINT prod_fincas_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_hoteleria prod_hoteleria_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_hoteleria
    ADD CONSTRAINT prod_hoteleria_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_mascotas prod_mascotas_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_mascotas
    ADD CONSTRAINT prod_mascotas_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_migracion prod_migracion_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_migracion
    ADD CONSTRAINT prod_migracion_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_pasaportes prod_pasaportes_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_pasaportes
    ADD CONSTRAINT prod_pasaportes_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_planes prod_planes_aerolineaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_planes
    ADD CONSTRAINT "prod_planes_aerolineaId_fkey" FOREIGN KEY ("aerolineaId") REFERENCES public.aerolineas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: prod_planes prod_planes_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_planes
    ADD CONSTRAINT prod_planes_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_planes prod_planes_paqueteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_planes
    ADD CONSTRAINT "prod_planes_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES public.paquetes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: prod_planes prod_planes_paquete_tarifa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_planes
    ADD CONSTRAINT prod_planes_paquete_tarifa_id_fkey FOREIGN KEY (paquete_tarifa_id) REFERENCES public.paquete_tarifas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: prod_restaurantes prod_restaurantes_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_restaurantes
    ADD CONSTRAINT prod_restaurantes_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_seguros prod_seguros_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_seguros
    ADD CONSTRAINT prod_seguros_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_simcards prod_simcards_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_simcards
    ADD CONSTRAINT prod_simcards_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_tiqueteria prod_tiqueteria_aerolineaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_tiqueteria
    ADD CONSTRAINT "prod_tiqueteria_aerolineaId_fkey" FOREIGN KEY ("aerolineaId") REFERENCES public.aerolineas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: prod_tiqueteria prod_tiqueteria_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_tiqueteria
    ADD CONSTRAINT prod_tiqueteria_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_tiqueteria prod_tiqueteria_planEquipajeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_tiqueteria
    ADD CONSTRAINT "prod_tiqueteria_planEquipajeId_fkey" FOREIGN KEY ("planEquipajeId") REFERENCES public.politicas_equipaje(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: prod_tours prod_tours_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_tours
    ADD CONSTRAINT prod_tours_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prod_visas prod_visas_detalle_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prod_visas
    ADD CONSTRAINT prod_visas_detalle_venta_id_fkey FOREIGN KEY (detalle_venta_id) REFERENCES public.detalle_venta(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: responsables responsables_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsables
    ADD CONSTRAINT responsables_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sesiones sesiones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tarjetas_agencia tarjetas_agencia_metodo_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tarjetas_agencia
    ADD CONSTRAINT tarjetas_agencia_metodo_pago_id_fkey FOREIGN KEY (metodo_pago_id) REFERENCES public.metodos_pago(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tramos_vuelo tramos_vuelo_aerolinea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tramos_vuelo
    ADD CONSTRAINT tramos_vuelo_aerolinea_id_fkey FOREIGN KEY (aerolinea_id) REFERENCES public.aerolineas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tramos_vuelo tramos_vuelo_aeropuerto_destino_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tramos_vuelo
    ADD CONSTRAINT tramos_vuelo_aeropuerto_destino_id_fkey FOREIGN KEY (aeropuerto_destino_id) REFERENCES public.aeropuertos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tramos_vuelo tramos_vuelo_aeropuerto_origen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tramos_vuelo
    ADD CONSTRAINT tramos_vuelo_aeropuerto_origen_id_fkey FOREIGN KEY (aeropuerto_origen_id) REFERENCES public.aeropuertos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tramos_vuelo tramos_vuelo_plan_equipaje_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tramos_vuelo
    ADD CONSTRAINT tramos_vuelo_plan_equipaje_id_fkey FOREIGN KEY (plan_equipaje_id) REFERENCES public.politicas_equipaje(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tramos_vuelo tramos_vuelo_prod_tiqueteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tramos_vuelo
    ADD CONSTRAINT tramos_vuelo_prod_tiqueteria_id_fkey FOREIGN KEY (prod_tiqueteria_id) REFERENCES public.prod_tiqueteria(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios usuarios_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ventas ventas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ventas ventas_comisionista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_comisionista_id_fkey FOREIGN KEY (comisionista_id) REFERENCES public.comisionistas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ventas ventas_metodo_pago_principal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_metodo_pago_principal_id_fkey FOREIGN KEY (metodo_pago_principal_id) REFERENCES public.metodos_pago(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ventas ventas_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.responsables(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ventas ventas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict O3B9HY0Mo75JA6Cydhds5AZhDnniX4fWvUnsJiNCd5GfgsEvOL25wwiQyvVxuZz

