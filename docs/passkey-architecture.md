# Passkey Authentication Architecture

## New Onboarding Flow

```mermaid
graph TD
    A[Welcome Screen] --> B{Device Supports Passkeys?}
    B -->|Yes| C[Enter with Passkey Button]
    B -->|No| D[Enter with Manual Seed Button]
    
    C --> E{Existing Passkey?}
    E -->|Yes| F[Authenticate with Passkey]
    E -->|No| G[Create New Passkey]
    
    F --> H[Load Existing Wallet]
    G --> I[Generate New Wallet]
    I --> J[Show Seed Phrase Backup]
    J --> K[Register Passkey]
    
    D --> L[Manual Seed Entry Screen]
    L --> M[Validate Seed Phrase]
    M --> N[Set Transaction Password]
    
    H --> O[Main Wallet Interface]
    K --> O
    N --> O
```

## Technical Architecture

```mermaid
graph TD
    A[Onboarding Screen] --> B[Passkey Service]
    B --> C[Platform Detection]
    
    C --> D[Web WebAuthn API]
    C --> E[Android Passkey API]
    
    B --> F[Wallet Service]
    F --> G[Key Derivation]
    F --> H[Secure Storage]
    
    G --> I[Seed Generation]
    G --> J[Private Key Derivation]
    
    H --> K[Encrypted Wallet Data]
    H --> L[Passkey Metadata]
```

## Key Components

### 1. Passkey Service
- Cross-platform abstraction layer
- Device capability detection
- Passkey registration and authentication
- Error handling and fallbacks

### 2. Simplified Onboarding
- Single welcome screen
- Two primary actions: Passkey or Manual
- Progressive disclosure of complexity
- Clear error states and recovery

### 3. Security Model
- Client-side only implementation
- Passkey-derived encryption keys
- Seed phrase backup as recovery method
- No server dependencies

### 4. Platform Support
- Web: WebAuthn API
- Android: Android Passkey API
- Consistent UX across platforms
- Graceful degradation for unsupported devices