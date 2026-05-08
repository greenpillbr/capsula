import { MiniAppIcon } from '@/components/mini-apps/MiniAppIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { MiniApp } from '@/db/schema';
import React, { useMemo } from 'react';
import { TextInput, View } from 'react-native';

type InstalledMiniAppsSectionProps = {
  installedApps: MiniApp[];
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  onLaunchMiniApp: (miniAppId: string) => void;
  onUninstallMiniApp: (miniAppId: string, miniAppTitle: string) => void;
};

export function InstalledMiniAppsSection({
  installedApps,
  searchQuery,
  onChangeSearch,
  onLaunchMiniApp,
  onUninstallMiniApp,
}: InstalledMiniAppsSectionProps) {
  const filteredInstalledApps = useMemo(
    () =>
      installedApps.filter((app) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) {
          return true;
        }

        return (
          app.title.toLowerCase().includes(normalizedQuery) ||
          (JSON.parse(app.categories || '[]') as string[]).some((category) =>
            category.toLowerCase().includes(normalizedQuery),
          ) ||
          app.description.toLowerCase().includes(normalizedQuery)
        );
      }),
    [installedApps, searchQuery],
  );

  return (
    <>
      <View className="px-4">
        <TextInput
          value={searchQuery}
          onChangeText={onChangeSearch}
          placeholder="Search mini-apps..."
          className="border border-border rounded-lg p-3 text-foreground bg-background"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {filteredInstalledApps.length > 0 && (
        <View className="px-4 mt-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Installed</Text>

          {filteredInstalledApps.map((app) => (
            <Card key={app.id} className="mb-4">
              <View className="p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <MiniAppIcon
                      miniAppId={app.id}
                      miniAppTitle={app.title}
                      containerClassName="w-12 h-12 bg-primary/10 rounded-lg items-center justify-center mr-3 overflow-hidden"
                      imageClassName="w-12 h-12"
                      fallbackTextClassName="text-primary text-lg font-bold"
                    />

                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-lg">{app.title}</Text>
                      <Text className="text-primary text-sm">
                        {(JSON.parse(app.categories || '[]') as string[])[0] || 'Tools'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <Button size="sm" onPress={() => onLaunchMiniApp(app.id)} className="bg-primary">
                      <Text className="text-primary-foreground text-xs">Open</Text>
                    </Button>
                    {!app.isBuiltIn && (
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => onUninstallMiniApp(app.id, app.title)}
                        className="border-error"
                      >
                        <Text className="text-error text-xs">Remove</Text>
                      </Button>
                    )}
                  </View>
                </View>

                <Text className="text-muted-foreground text-sm leading-5 mb-3">{app.description}</Text>

                {app.isBuiltIn && (
                  <Badge variant="secondary" className="self-start">
                    <Text className="text-xs">Built-in</Text>
                  </Badge>
                )}
              </View>
            </Card>
          ))}
        </View>
      )}
    </>
  );
}
