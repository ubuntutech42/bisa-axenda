
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteManager } from "./QuoteManager";
import { EventManager } from "./EventManager";
import { NotificationSender } from "./NotificationSender";


export function AdminPanel() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Painel de Administrador</CardTitle>
            <CardDescription>
                Gerencie o conteúdo global e envie notificações para os usuários.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="notifications">Notificações</TabsTrigger>
                    <TabsTrigger value="quotes">Citações</TabsTrigger>
                    <TabsTrigger value="events">Eventos</TabsTrigger>
                </TabsList>
                <TabsContent value="notifications">
                    <NotificationSender />
                </TabsContent>
                <TabsContent value="quotes">
                    <QuoteManager />
                </TabsContent>
                <TabsContent value="events">
                    <EventManager />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
