# bem-definitions README

"Go to" definition providers for bem files: styles with cn() and translations with react-intl

## Styles

You can use `cmd + click` on cn function name in next situations for styles:

```jsx
<Table
    className={cnCompaniesTable({}, [className])}
    ...
```

```jsx
export const AppSpin: FC<AppSpinProps> = () => (
  <Spin
    size="large"
    className={cnApp("spin")}
    tip={<FormattedMessage id="app.loading" />}
  />
);
```

```jsx
<AntApp className={cnApp()}>
...
```

```jsx
<Col className={cnTrackVersionForm('column', { type: 'main' })} span={16}>
```

```jsx
<Col className={cnTrackVersionForm('column', { type })} span={16}>
```

## Translations

You can use `cmd + click` on any word in translation key in next situations for translations:

```jsx
<FormattedMessage id="track-version-form.copy" />
```

```jsx
<FormattedMessage
  key="track-version-form.milestones"
  id="track-version-form.milestones"
/>
```

```jsx
<FormMessage prefix="label" name="content" />
```

```jsx
{
    title: intl.formatMessage({ id: 'companies-table.phone' }),
    dataIndex: 'representative_phone',
    key: 'representative_phone',
}
```
