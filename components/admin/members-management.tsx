import Link from "next/link";

import type { AdminMemberRecord } from "@/lib/admin/member-management";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  extendMembershipAction,
  updateMemberAction,
} from "@/lib/admin/actions";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/admin/ui";

const inputClassName =
  "h-11 w-full rounded-lg border border-[var(--border-default)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition-[border-color,box-shadow] focus-visible:border-[var(--focus-ring-color)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]/25";

function RoleBadge({ role }: { role: AdminMemberRecord["role"] }) {
  return role === "admin" ? (
    <Badge className="bg-[color:color-mix(in_srgb,var(--color-fig)_14%,white)] text-[var(--color-fig)]">
      Administrador
    </Badge>
  ) : (
    <Badge className="bg-[color:color-mix(in_srgb,var(--color-verde)_14%,white)] text-[var(--color-verde)]">
      Miembro
    </Badge>
  );
}

export function MembersManagement({
  members,
}: {
  members: AdminMemberRecord[];
}) {
  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[var(--text-muted)] uppercase">
            Gestión de acceso
          </p>
          <h2 className="mt-2 text-[28px] font-semibold text-[var(--text-primary)]">
            Miembros
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            Revisa perfiles, ajusta roles y extiende vigencias sin alterar el
            flujo manual de administración.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/members/new">Crear cuenta y perfil</Link>
        </Button>
      </section>

      <section>
        <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
          <CardHeader>
            <CardDescription className="tracking-[0.08em] uppercase">
              Gestión
            </CardDescription>
            <CardTitle>Miembros actuales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.length === 0 ? (
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Todavía no hay perfiles disponibles para administración.
              </p>
            ) : (
              <>
                <div className="hidden xl:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Miembro</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead>Último acceso</TableHead>
                        <TableHead className="w-[440px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="align-top">
                            <div className="space-y-1 whitespace-normal">
                              <p className="font-semibold text-[var(--text-primary)]">
                                {member.fullName}
                              </p>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {member.email ?? "Sin correo disponible"}
                              </p>
                              <p className="text-xs leading-5 text-[var(--text-muted)]">
                                Creado: {formatDateLabel(member.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <RoleBadge role={member.role} />
                          </TableCell>
                          <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                            {formatDateLabel(member.membershipExpiresAt)}
                          </TableCell>
                          <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                            {formatDateTimeLabel(member.lastSignInAt)}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="grid gap-3">
                              <form
                                action={updateMemberAction}
                                className="grid gap-3 md:grid-cols-[minmax(0,160px)_minmax(0,180px)_auto]"
                              >
                                <input
                                  type="hidden"
                                  name="redirect_to"
                                  value="/admin/members"
                                />
                                <input
                                  type="hidden"
                                  name="member_id"
                                  value={member.id}
                                />
                                <select
                                  name="role"
                                  defaultValue={member.role}
                                  className={inputClassName}
                                >
                                  <option value="member">Miembro</option>
                                  <option value="admin">Administrador</option>
                                </select>
                                <input
                                  type="date"
                                  name="membership_date"
                                  defaultValue={member.membershipExpiresAt.slice(
                                    0,
                                    10,
                                  )}
                                  required
                                  className={inputClassName}
                                />
                                <Button type="submit" variant="outline">
                                  Guardar cambios
                                </Button>
                              </form>

                              <form action={extendMembershipAction}>
                                <input
                                  type="hidden"
                                  name="redirect_to"
                                  value="/admin/members"
                                />
                                <input
                                  type="hidden"
                                  name="member_id"
                                  value={member.id}
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="secondary"
                                >
                                  Extender 1 año
                                </Button>
                              </form>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 xl:hidden">
                  {members.map((member) => (
                    <Card
                      key={member.id}
                      size="sm"
                      className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] shadow-none"
                    >
                      <CardContent className="space-y-4 pt-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-[var(--text-primary)]">
                              {member.fullName}
                            </h3>
                            <RoleBadge role={member.role} />
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {member.email ?? "Sin correo disponible"}
                          </p>
                          <p className="text-xs leading-6 text-[var(--text-muted)]">
                            Vigente hasta{" "}
                            {formatDateLabel(member.membershipExpiresAt)} ·
                            Último acceso{" "}
                            {formatDateTimeLabel(member.lastSignInAt)}
                          </p>
                        </div>

                        <form
                          action={updateMemberAction}
                          className="grid gap-3"
                        >
                          <input
                            type="hidden"
                            name="redirect_to"
                            value="/admin/members"
                          />
                          <input
                            type="hidden"
                            name="member_id"
                            value={member.id}
                          />
                          <select
                            name="role"
                            defaultValue={member.role}
                            className={inputClassName}
                          >
                            <option value="member">Miembro</option>
                            <option value="admin">Administrador</option>
                          </select>
                          <input
                            type="date"
                            name="membership_date"
                            defaultValue={member.membershipExpiresAt.slice(
                              0,
                              10,
                            )}
                            required
                            className={inputClassName}
                          />
                          <Button type="submit" variant="outline">
                            Guardar cambios
                          </Button>
                        </form>

                        <form action={extendMembershipAction}>
                          <input
                            type="hidden"
                            name="redirect_to"
                            value="/admin/members"
                          />
                          <input
                            type="hidden"
                            name="member_id"
                            value={member.id}
                          />
                          <Button type="submit" variant="secondary">
                            Extender 1 año
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
