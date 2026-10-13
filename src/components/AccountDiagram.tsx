import type { ComponentType, ReactNode, SVGProps } from 'react'
import { accountDiagram } from './AccountDiagram.styles'
import { docsIcons } from './DocsIcon'

type IconName = keyof typeof docsIcons

const diagrams = {
  address: AccountAddress,
  signers: SignerApproval,
  'access-keys': AccessKeyBounds,
  login: LoginApproval,
  'account-types': AccountTypes,
  'single-key': SingleKeyAccount,
  configurable: ConfigurableAccount,
  keychain: KeychainAuthority,
}

/**
 * Account diagrams: compact strips of icon chips, drawn in HTML so they wrap at phone width and
 * follow the docs theme. The figure is one image to assistive technology; `alt` carries the full
 * description, and the Markdown export renders `alt` in its place.
 */
export function AccountDiagram({ name, alt }: { name: keyof typeof diagrams; alt: string }) {
  const Diagram = diagrams[name]
  return (
    <figure
      className={`account-diagram ${accountDiagram().className}`}
      data-diagram={name}
      role="img"
      aria-label={alt}
    >
      <div className="ad-canvas">
        <Diagram />
      </div>
    </figure>
  )
}

function Icon({ name }: { name: IconName }) {
  const Svg: ComponentType<SVGProps<SVGSVGElement>> = docsIcons[name]
  return (
    <Svg
      className="ad-icon"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      strokeWidth="1.75"
    />
  )
}

/** An icon and a one- or two-word label, with an optional trailing value or icon. */
function Chip({
  icon,
  label,
  value,
  tone,
}: {
  icon: IconName
  label: string
  value?: ReactNode
  tone?: 'strong' | 'quiet'
}) {
  return (
    <span className={tone ? `ad-chip ad-chip-${tone}` : 'ad-chip'}>
      <Icon name={icon} />
      {label}
      {value !== undefined && <span className="ad-value">{value}</span>}
    </span>
  )
}

/**
 * A joining glyph and the chip after it. They wrap together, so a line never ends on a glyph.
 */
function Then({ glyph = '→', children }: { glyph?: string; children: ReactNode }) {
  return (
    <span className="ad-then">
      <span className="ad-glyph">{glyph}</span>
      {children}
    </span>
  )
}

function AccountAddress() {
  return (
    <div className="ad-strip">
      <span className="ad-chip ad-chip-strong">
        <Icon name="document" />
        Address
        <span className="ad-sep" />
        <Icon name="limit" />
        TIP-20
      </span>
      <Then>
        <span className="ad-chip">
          <Icon name="accessKey" />
          Single key
          <span className="ad-or">or</span>
          <Icon name="threshold" />
          Configurable
        </span>
      </Then>
      <Then glyph="+">
        <Chip icon="accessKey" label="Access keys" tone="quiet" />
      </Then>
    </div>
  )
}

function SignerApproval() {
  return (
    <div className="ad-strip">
      <Chip icon="passkey" label="Passkey" value="1" />
      <Then glyph="+">
        <Chip icon="accessKey" label="Key" value="1" />
      </Then>
      <Then glyph="+">
        <Chip icon="login" label="Login" value="1" />
      </Then>
      <Then glyph="≥">
        <Chip icon="threshold" label="Threshold" value="2" tone="strong" />
      </Then>
    </div>
  )
}

function AccessKeyBounds() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="accessKey" label="Access key" tone="strong" />
        <Then>
          <span className="ad-group">
            <Chip icon="limit" label="Limit" />
            <Chip icon="expiry" label="Expiry" />
            <Chip icon="contract" label="Scopes" />
          </span>
        </Then>
      </div>
      <div className="ad-strip ad-strip-note">
        <Chip icon="rules" label="Admin key" tone="quiet" />
        <span className="ad-note">No limits · manages keys</span>
      </div>
    </div>
  )
}

function LoginApproval() {
  return (
    <div className="ad-strip">
      <Chip icon="device" label="Device" value={<Icon name="accessKey" />} tone="strong" />
      <Then>
        <Chip icon="login" label="ID token" tone="quiet" />
      </Then>
      <Then>
        <Chip icon="verified" label="Proof" tone="quiet" />
      </Then>
      <Then>
        <Chip icon="approved" label="Tempo" />
      </Then>
    </div>
  )
}

function AccountTypes() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="accessKey" label="Single key" />
        <Then>
          <Chip icon="upgrade" label="Upgrade" tone="quiet" />
        </Then>
        <Then>
          <Chip icon="threshold" label="Configurable" />
        </Then>
      </div>
      <div className="ad-strip">
        <Chip icon="rules" label="Account Keychain" value={<Icon name="accessKey" />} tone="strong" />
      </div>
      <div className="ad-strip ad-strip-note">
        <span className="ad-note">Access keys for both</span>
      </div>
    </div>
  )
}

function SingleKeyAccount() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="accessKey" label="Root key" tone="strong" />
        <Then>
          <Chip icon="document" label="Address" />
        </Then>
        <Then glyph="+">
          <Chip icon="accessKey" label="Access keys" tone="quiet" />
        </Then>
      </div>
      <div className="ad-strip ad-strip-note">
        <Chip icon="upgrade" label="Upgrade" tone="quiet" />
        <span className="ad-note">Same address · version 1</span>
      </div>
    </div>
  )
}

function ConfigurableAccount() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="rules" label="Configuration" value="v0" />
        <Then>
          <Chip icon="document" label="Address" tone="strong" />
        </Then>
      </div>
      <div className="ad-strip">
        <Chip icon="team" label="Owner signatures" />
        <Then glyph="+">
          <Chip icon="rules" label="Configuration" />
        </Then>
        <Then>
          <Chip icon="verified" label="Hash match" tone="quiet" />
        </Then>
        <Then>
          <Chip icon="approved" label="Executes" tone="strong" />
        </Then>
      </div>
    </div>
  )
}

function KeychainAuthority() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="team" label="Account" />
        <Then>
          <Chip icon="accessKey" label="Access key" tone="strong" />
        </Then>
        <Then>
          <span className="ad-group">
            <Chip icon="limit" label="Limit" />
            <Chip icon="expiry" label="Expiry" />
            <Chip icon="contract" label="Scopes" />
          </span>
        </Then>
      </div>
      <div className="ad-strip ad-strip-note">
        <Chip icon="revoke" label="Revoke" tone="quiet" />
        <span className="ad-note">Permanent per key</span>
      </div>
    </div>
  )
}
