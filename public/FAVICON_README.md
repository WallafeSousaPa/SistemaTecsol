# Favicon do Sistema Tecsol

## Arquivos de Favicon

### 1. `favicon.svg` (Principal)
- **Formato**: SVG vetorial
- **Vantagens**: Escalável, pequeno tamanho, suporte moderno
- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)

### 2. `favicon.ico` (Fallback)
- **Formato**: ICO tradicional
- **Vantagens**: Compatibilidade com navegadores antigos
- **Navegadores**: Todos os navegadores

## Como Gerar o Favicon ICO

### Opção 1: Online (Recomendado)
1. Acesse: https://convertio.co/svg-ico/ ou https://favicon.io/
2. Faça upload do arquivo `favicon.svg`
3. Configure o tamanho para 32x32 pixels
4. Baixe o arquivo `favicon.ico`
5. Coloque na pasta `public/`

### Opção 2: Software Local
- **Windows**: Use o GIMP ou Photoshop
- **Mac**: Use o Preview ou Sketch
- **Linux**: Use o GIMP ou Inkscape

### Opção 3: Comando (se tiver ImageMagick)
```bash
convert favicon.svg -resize 32x32 favicon.ico
```

## Estrutura do Favicon

O favicon representa:
- **Letra T**: Inicial de "Tecsol"
- **Cores**: Gradiente azul (#667eea) para roxo (#764ba2)
- **Design**: Circular com elementos decorativos
- **Estilo**: Profissional e moderno.

## Configuração no HTML

```html
<link rel="icon" href="%PUBLIC_URL%/favicon.svg" type="image/svg+xml" />
<link rel="alternate icon" href="%PUBLIC_URL%/favicon.ico" />
```

## Configuração no Manifest

```json
{
  "icons": [
    {
      "src": "favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ]
}
```

## Teste

Para testar se está funcionando:
1. Abra o sistema no navegador
2. Verifique se o ícone aparece na aba
3. Verifique se aparece nos favoritos
4. Teste em diferentes navegadores
