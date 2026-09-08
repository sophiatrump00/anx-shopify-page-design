FROM node:22.23.1-bookworm-slim
WORKDIR /app
COPY assets/suntneew-member-drops-core.js ./assets/
COPY tools/member-drops/native/*.mjs ./tools/member-drops/native/
ENV PORT=8787
EXPOSE 8787
USER node
CMD ["node", "tools/member-drops/native/service.mjs"]
