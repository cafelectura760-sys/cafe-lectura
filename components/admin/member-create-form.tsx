"use client";

import Link from "next/link";

import { createMemberAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/password-field";

const inputClassName =
  "h-11 w-full rounded-lg border border-[var(--border-default)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition-[border-color,box-shadow] focus-visible:border-[var(--focus-ring-color)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]/25";

export function MemberCreateForm({
  defaultMembershipDate,
}: {
  defaultMembershipDate: string;
}) {
  return (
    <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardDescription className="tracking-[0.08em] uppercase">
            Alta manual
          </CardDescription>
          <CardTitle>Crear cuenta y perfil</CardTitle>
          <CardDescription className="mt-2 max-w-2xl">
            Registra un nuevo acceso administrativo o de miembro manteniendo el
            flujo manual aprobado para el proyecto.
          </CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/members">Volver al listado</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <form action={createMemberAction} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="redirect_to" value="/admin/members/new" />
          <input
            type="hidden"
            name="success_redirect_to"
            value="/admin/members"
          />

          <div className="grid gap-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              type="text"
              name="full_name"
              required
              className={inputClassName}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              name="email"
              required
              className={inputClassName}
            />
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Contraseña temporal"
            required
            minLength={8}
            labelClassName="text-sm font-medium text-[var(--text-primary)]"
            inputClassName={`${inputClassName} pr-14`}
            wrapperClassName="password-field-wrap"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="role">Rol inicial</Label>
              <select
                id="role"
                name="role"
                defaultValue="member"
                className={inputClassName}
              >
                <option value="member">Miembro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="membership_date">Vencimiento de membresía</Label>
              <Input
                id="membership_date"
                type="date"
                name="membership_date"
                defaultValue={defaultMembershipDate}
                required
                className={inputClassName}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <Button type="submit">Crear cuenta y perfil</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
