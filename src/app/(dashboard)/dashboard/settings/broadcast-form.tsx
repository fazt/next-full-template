"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input, Textarea } from "@/components/ui/input";
import { apiRequest, applyFieldErrors } from "@/libs/http";
import { pushMessageSchema, type PushMessageInput } from "@/libs/validations/push";

/** Solo admins: envía una notificación a todas las suscripciones. */
export function BroadcastForm() {
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PushMessageInput>({
    resolver: zodResolver(pushMessageSchema),
    defaultValues: { title: "", body: "", url: "/dashboard" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setMessage(null);
    const result = await apiRequest<{ data: { sent: number; failed: number } }>("/api/push/broadcast", { body: data });
    if (!result.ok) {
      if (!applyFieldErrors(setError, result.fieldErrors)) setMessage({ tone: "danger", text: result.error });
      return;
    }
    reset();
    setMessage({
      tone: "success",
      text: `Enviada a ${result.data.data.sent} suscripción(es)${result.data.data.failed ? `, ${result.data.data.failed} fallida(s)` : ""}.`,
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <Field label="Título" htmlFor="title" error={errors.title?.message}>
        <Input {...fieldAria("title", errors.title?.message)} {...register("title")} />
      </Field>
      <Field label="Mensaje" htmlFor="body" error={errors.body?.message}>
        <Textarea rows={2} {...fieldAria("body", errors.body?.message)} {...register("body")} />
      </Field>
      <Field label="Ruta al hacer clic" htmlFor="url" error={errors.url?.message} hint="Ruta interna, p. ej. /dashboard/products.">
        <Input {...fieldAria("url", errors.url?.message)} {...register("url")} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Enviar a todos
        </Button>
      </div>
    </form>
  );
}
