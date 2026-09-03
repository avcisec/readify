FROM python:3.12.12-slim@sha256:f3fa41d74a768c2fce8016b98c191ae8c1bacd8f1152870a3f9f87d350920b7c

WORKDIR /app
ENV STANZA_RESOURCES_DIR=/opt/stanza_resources
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN useradd --create-home --uid 10001 readify && install -d -o readify -g readify /opt/stanza_resources
USER readify
RUN python -c "import stanza; stanza.download('fr', processors='tokenize,mwt,pos,lemma', model_dir='/opt/stanza_resources', resources_version='1.14.0', verbose=False)"
COPY --chown=readify:readify worker.py ./

ENTRYPOINT ["python", "worker.py"]
