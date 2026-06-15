#!/bin/bash
KEY="$(dirname "$0")/3205_keypair.pem"
SERVER="ubuntu@3.39.191.121"
FRONT="$(dirname "$0")/star-spot-client/front"

case "$1" in
  front)
    echo "🔨 프론트 빌드 중..."
    cd "$FRONT" && npm run build
    echo "📤 EC2 업로드 중..."
    scp -i "$KEY" -r dist/. $SERVER:/home/ubuntu/star-spot/frontend/
    ssh -i "$KEY" $SERVER "sudo systemctl reload nginx"
    echo "✅ 프론트 배포 완료"
    ;;
  back)
    echo "📤 백엔드 업로드 중..."
    scp -i "$KEY" -r "$(dirname "$0")/star-spot-server/backend/src" $SERVER:/home/ubuntu/star-spot/backend/
    ssh -i "$KEY" $SERVER "pm2 restart all"
    echo "✅ 백엔드 배포 완료"
    ;;
  all)
    bash "$0" front
    bash "$0" back
    ;;
  *)
    echo "사용법:"
    echo "  ./deploy.sh front   # 프론트만 배포"
    echo "  ./deploy.sh back    # 백엔드만 배포"
    echo "  ./deploy.sh all     # 둘 다 배포"
    ;;
esac
