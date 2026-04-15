'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  Copy,
  Bell,
  Settings,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';

function ColorsSection() {
  const colorGroups = [
    { name: 'Primary', colors: [
      { var: '--primary-50', bg: 'bg-primary-50', text: 'text-primary-50' },
      { var: '--primary-100', bg: 'bg-primary-100', text: 'text-primary-100' },
      { var: '--primary-200', bg: 'bg-primary-200', text: 'text-primary-200' },
      { var: '--primary-300', bg: 'bg-primary-300', text: 'text-primary-300' },
      { var: '--primary-400', bg: 'bg-primary-400', text: 'text-primary-400' },
      { var: '--primary-500', bg: 'bg-primary-500', text: 'text-primary-500' },
      { var: '--primary-600', bg: 'bg-primary-600', text: 'text-primary-600' },
      { var: '--primary-700', bg: 'bg-primary-700', text: 'text-primary-700' },
      { var: '--primary-800', bg: 'bg-primary-800', text: 'text-primary-800' },
      { var: '--primary-900', bg: 'bg-primary-900', text: 'text-primary-900' },
    ]},
    { name: 'Error', colors: [
      { var: '--error-50', bg: 'bg-error-50', text: 'text-error-50' },
      { var: '--error-100', bg: 'bg-error-100', text: 'text-error-100' },
      { var: '--error-500', bg: 'bg-error-500', text: 'text-error-500' },
      { var: '--error-600', bg: 'bg-error-600', text: 'text-error-600' },
      { var: '--error-700', bg: 'bg-error-700', text: 'text-error-700' },
    ]},
    { name: 'Success', colors: [
      { var: '--success-50', bg: 'bg-success-50', text: 'text-success-50' },
      { var: '--success-500', bg: 'bg-success-500', text: 'text-success-500' },
      { var: '--success-600', bg: 'bg-success-600', text: 'text-success-600' },
    ]},
    { name: 'Warning', colors: [
      { var: '--warning-50', bg: 'bg-warning-50', text: 'text-warning-50' },
      { var: '--warning-500', bg: 'bg-warning-500', text: 'text-warning-500' },
      { var: '--warning-600', bg: 'bg-warning-600', text: 'text-warning-600' },
    ]},
    { name: 'Info', colors: [
      { var: '--info-50', bg: 'bg-info-50', text: 'text-info-50' },
      { var: '--info-500', bg: 'bg-info-500', text: 'text-info-500' },
      { var: '--info-600', bg: 'bg-info-600', text: 'text-info-600' },
    ]},
  ];

  return (
    <div className="space-y-8">
      {colorGroups.map((group) => (
        <div key={group.name}>
          <h3 className="mb-4 text-lg font-semibold">{group.name}</h3>
          <div className="grid grid-cols-5 gap-2">
            {group.colors.map((color) => (
              <div key={color.var} className="flex flex-col items-center gap-2">
                <div className={`h-12 w-full rounded-lg ${color.bg} border`} />
                <span className="text-xs text-neutral-500">{color.var}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ButtonsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="icon-sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
          <Button variant="secondary">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">States</h3>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </div>
    </div>
  );
}

function InputsSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Default Input</label>
          <Input placeholder="Enter text..." />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">With Label</label>
          <Input placeholder="Enter text..." />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">With Icon</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Search..." className="pl-10" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Disabled</label>
          <Input placeholder="Disabled" disabled />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Error</label>
          <Input placeholder="Error state" className="border-error-500" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Success</label>
          <Input placeholder="Success state" className="border-success-500" />
        </div>
      </div>
    </div>
  );
}

function BadgesSection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="infoOutline">Info Outline</Badge>
          <Badge variant="warningOutline">Warning Outline</Badge>
          <Badge variant="errorOutline">Error Outline</Badge>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm">Small</Badge>
          <Badge size="default">Default</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>
    </div>
  );
}

function CardsSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content with some example text.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>With Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Card with action buttons.</p>
          <div className="flex gap-2">
            <Button size="sm">Accept</Button>
            <Button size="sm" variant="outline">Decline</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-primary-200 bg-primary-50">
        <CardHeader>
          <CardTitle className="text-primary-700">Featured Card</CardTitle>
        </CardHeader>
        <CardContent className="text-primary-600">
          <p>This is a featured card variant.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AlertsSection() {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>This is an informational alert.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your action was completed successfully.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This action may have unintended consequences.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong. Please try again.</AlertDescription>
      </Alert>
    </div>
  );
}

function SelectSection() {
  return (
    <div className="space-y-4">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectItem value="opt1">Option 1</SelectItem>
            <SelectItem value="opt2">Option 2</SelectItem>
            <SelectItem value="opt3">Option 3</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Group 2</SelectLabel>
            <SelectItem value="opt4">Option 4</SelectItem>
            <SelectItem value="opt5" disabled>Disabled Option</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function CheckboxSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox id="cb1" />
        <label htmlFor="cb1" className="text-sm font-medium">Default checkbox</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="cb2" checked />
        <label htmlFor="cb2" className="text-sm font-medium">Checked checkbox</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="cb3" disabled />
        <label htmlFor="cb3" className="text-sm font-medium">Disabled checkbox</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="cb4" checked disabled />
        <label htmlFor="cb4" className="text-sm font-medium">Disabled checked checkbox</label>
      </div>
    </div>
  );
}

function AvatarSection() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>SB</AvatarFallback>
      </Avatar>
    </div>
  );
}

function TooltipSection() {
  return (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a tooltip</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Top</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Top tooltip</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Bottom tooltip</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Skeleton Card</h4>
        <SkeletonCard />
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Skeleton Table</h4>
        <SkeletonTable rows={3} />
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Individual Skeletons</h4>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            Design System
          </h1>
          <p className="mt-1 text-neutral-500">
            Preview of all UI components and design tokens
          </p>
        </div>

        <Tabs defaultValue="buttons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="form">Form Controls</TabsTrigger>
            <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6">
            <ColorsSection />
          </TabsContent>

          <TabsContent value="buttons" className="space-y-6">
            <ButtonsSection />
          </TabsContent>

          <TabsContent value="inputs" className="space-y-6">
            <InputsSection />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <BadgesSection />
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <CardsSection />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsSection />
          </TabsContent>

          <TabsContent value="form" className="space-y-8">
            <SelectSection />
            <CheckboxSection />
            <AvatarSection />
            <TooltipSection />
          </TabsContent>

          <TabsContent value="skeletons" className="space-y-6">
            <SkeletonSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
